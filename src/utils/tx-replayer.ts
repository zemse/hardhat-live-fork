import { ethers } from "ethers";
import { EthereumProvider } from "hardhat/types";

import { BlockWithTransactions } from "@ethersproject/abstract-provider";

import { fundBalance, impersonateAccount, sendTx } from "./hardhat-helpers";
import { getHardhatNetworkProvider } from "./hardhat-network-provider";
import { logger } from "./logger";
import { retrieveForkUrlAndBlock } from "./retrive-fork-url-and-block";

export type TxMatcher = (tx: ethers.providers.TransactionResponse) => boolean;

export async function startTxReplayer(
  wrappedProvider: EthereumProvider,
  matcher: TxMatcher | undefined,
  delay: number
) {
  const provider = await getHardhatNetworkProvider(wrappedProvider);
  const fork = await retrieveForkUrlAndBlock(provider);
  const remoteProvider = new ethers.providers.JsonRpcBatchProvider(fork.url);

  const impersonatedAddresses = new Map<string, boolean>();
  let syncedBlockNumber: number = fork.block;

  while (1) {
    await replayUptoLatest();

    // cool down for a bit
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  async function replayUptoLatest() {
    // get latest block number
    const target = await remoteProvider.getBlockNumber();
    let batchTarget: number;
    do {
      // only fetch 50 blocks at a time
      // TODO make it by chain id
      batchTarget = Math.min(target, syncedBlockNumber + 50);

      if (batchTarget !== syncedBlockNumber) {
        let blocks: BlockWithTransactions[] = [];
        if (batchTarget !== syncedBlockNumber + 1) {
          // make a batch query to fetch all the unreplayed blocks so far
          logger(
            `Receiving ${batchTarget - syncedBlockNumber} blocks: from ${
              syncedBlockNumber + 1
            } to ${batchTarget} (latest: ${target})`
          );
          blocks = await Promise.all(
            new Array(batchTarget - syncedBlockNumber)
              .fill(null)
              .map((_, i) => {
                const number: number = syncedBlockNumber + 1 + i;
                return remoteProvider.getBlockWithTransactions(number);
              })
          );
        } else {
          // fetch the one replayed block
          logger(`Receiving 1 block: ${batchTarget}`);
          blocks = [await remoteProvider.getBlockWithTransactions(batchTarget)];
        }

        // replay matched successful txs from each block
        await replayBlocks(blocks);

        // start after target
        syncedBlockNumber = batchTarget;
      }
    } while (batchTarget !== target);
  }

  async function replayBlocks(blocks: BlockWithTransactions[]) {
    const txsMatched: ethers.providers.TransactionResponse[] = [];

    let totalTxs = 0;

    // ignore unmatched txs
    for (const block of blocks) {
      for (const tx of block.transactions) {
        if (!matcher || matcher(tx)) {
          txsMatched.push(tx);
        }
      }
      totalTxs += block.transactions.length;
    }

    // ignore reverted / out of gas txs
    const rcs = await Promise.all(
      txsMatched.map((tx) => remoteProvider.getTransactionReceipt(tx.hash))
    );

    const txsToReplay = txsMatched.filter((_, i) => !!rcs[i].status);

    logger(`Matched ${txsToReplay.length} out of ${totalTxs} txs`);

    for (const tx of txsToReplay) {
      // impersonate the address if not already
      if (!impersonatedAddresses.get(tx.from)) {
        await impersonateAccount(provider, tx.from);
      }
      impersonatedAddresses.set(tx.from, true);

      // replay the tx
      const timeStart = Date.now();
      let i = 2;
      while (i--) {
        try {
          await sendTx(provider, tx);
        } catch (e) {
          const errorMessage = (e as any).message as string;
          if (errorMessage.includes("doesn't have enough funds to send tx")) {
            // fund tx.from
            await fundBalance(provider, tx.from);
            continue; // and then try once more
          } else {
            console.error(e);
          }
        }
        break;
      }
      const timeEnd = Date.now();
      logger(
        `Successfully replayed tx ${tx.hash} (took: ${timeEnd - timeStart}ms)`
      );
    }
  }
}
