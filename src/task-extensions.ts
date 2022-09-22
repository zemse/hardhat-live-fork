import { ethers } from "ethers";
import {
  TASK_NODE_GET_PROVIDER,
  TASK_NODE_SERVER_CREATED,
} from "hardhat/builtin-tasks/task-names";
import { subtask } from "hardhat/config";

import {
  getHardhatNetworkProvider,
  logger,
  retrieveForkUrlAndBlock,
  startTxReplayer,
} from "./utils";

subtask(TASK_NODE_GET_PROVIDER).setAction(async (args, hre, runSuper) => {
  if (!hre.config.liveFork.enabled) return;

  const provider = await runSuper(args);

  // Unwrap the low level provider
  const hardhatNetworkProvider = await getHardhatNetworkProvider(provider);

  // Get fork info from the low level provider
  let fork = await retrieveForkUrlAndBlock(hardhatNetworkProvider);

  // Update fork if needed
  const remoteProvider = new ethers.providers.JsonRpcBatchProvider(fork.url);

  let liveForkBlockNumber: number;
  switch (hre.config.liveFork.forkBlockNumber) {
    case "latest":
      liveForkBlockNumber = await remoteProvider.getBlockNumber();
      break;
    case "auto":
      // to avoid using different fork block number always, we can use a nearest checkpoint block
      // and sync from there. so that cache is present.
      liveForkBlockNumber = await remoteProvider.getBlockNumber();
      liveForkBlockNumber = Math.max(
        liveForkBlockNumber - (liveForkBlockNumber % 5000),
        fork.block
      );
      break;
    default:
      liveForkBlockNumber = hre.config.liveFork.forkBlockNumber;
      break;
  }

  if (liveForkBlockNumber - fork.block > 500) {
    // If user specified some fork block number, its not practical to replay
    // all the txs so far since it'd involve a lot of rpc requests.
    // Hence, the intended way to use live fork is to fork from a recent block.

    // Forking from the current block number
    logger(
      `Configured fork block is ${fork.block}. Changing it to ${liveForkBlockNumber}.`
    );

    await hardhatNetworkProvider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: fork.url,
            blockNumber: liveForkBlockNumber,
          },
        },
      ],
    });
  }

  return provider;
});

subtask(TASK_NODE_SERVER_CREATED).setAction(async (args, hre, runSuper) => {
  if (!hre.config.liveFork.enabled) return;

  // Start the tx replayer in parallel
  startTxReplayer(
    args.provider,
    hre.config.liveFork.txMatcher,
    hre.config.liveFork.delay
  ).catch(console.error);
});
