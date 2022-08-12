import { ethers } from "ethers";
import { TASK_NODE_SERVER_CREATED } from "hardhat/builtin-tasks/task-names";
import { subtask } from "hardhat/config";
import { EthereumProvider, JsonRpcServer } from "hardhat/types";
import {
  getHardhatNetworkProvider,
  retrieveForkUrlAndBlock,
  startTxReplayer,
  logger,
} from "./utils";

subtask(TASK_NODE_SERVER_CREATED).setAction(
  async (
    {
      provider,
    }: {
      hostname: string;
      port: number;
      provider: EthereumProvider;
      server: JsonRpcServer;
    },
    { config },
    runSuper
  ) => {
    if (!config.liveFork.enabled) return;

    // Unwrap the low level provider
    const hardhatNetworkProvider = await getHardhatNetworkProvider(provider);

    // Get fork info from the low level provider
    let { forkUrl, forkBlock } = await retrieveForkUrlAndBlock(
      hardhatNetworkProvider
    );

    // Update fork if needed
    const remoteProvider = new ethers.providers.JsonRpcBatchProvider(forkUrl);
    const latestBlock = await remoteProvider.getBlockNumber();
    if (latestBlock - forkBlock > 500) {
      // If user specified some fork block number, its not practical to replay
      // all the txs so far since it'd involve a lot of rpc requests.
      // Hence, the intended way to use live fork is to fork from a recent block.

      // Forking from the current block number
      logger(`Fork block is ${forkBlock}. Updating to ${latestBlock}.`);

      await provider.request({
        method: "hardhat_reset",
        params: [
          {
            forking: {
              jsonRpcUrl: forkUrl,
              blockNumber: latestBlock,
            },
          },
        ],
      });
    }

    // Start the tx replayer in parallel
    startTxReplayer(
      hardhatNetworkProvider,
      remoteProvider,
      latestBlock,
      config.liveFork.txMatcher,
      config.liveFork.delay
    ).catch(console.error);

    // In case there are other plugins
    runSuper();
  }
);
