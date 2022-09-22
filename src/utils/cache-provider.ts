import { BlockWithTransactions } from "@ethersproject/abstract-provider";
import { JsonRpcBatchProvider } from "@ethersproject/providers";

const PROJECT_ROOT = process.cwd();

// TODO cache get block calls so that they are not repeated
// after a fork closed and created again.
// store the info on disk.
export class CacheJsonRpcBatchProvider extends JsonRpcBatchProvider {
  async getBlockWithTransactions(
    blockNumber: number
  ): Promise<BlockWithTransactions> {
    return await super.getBlockWithTransactions(blockNumber);
  }
}
