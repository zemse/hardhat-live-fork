import { ForkBlockchain } from "hardhat/internal/hardhat-network/provider/fork/ForkBlockchain";
import { HardhatNetworkProvider } from "hardhat/internal/hardhat-network/provider/provider";

export async function retrieveForkUrlAndBlock(
  provider: HardhatNetworkProvider
) {
  if (provider["_node"] === undefined) {
    await provider["_init"]();
  }
  const forkBlockchain = provider["_node"]?.["_blockchain"];

  if (forkBlockchain.constructor.name !== ForkBlockchain.name) {
    throw new Error("Provider has not been initialised with forkConfig");
  }
  const url: string = forkBlockchain["_jsonRpcClient"]["_httpProvider"]["_url"];
  const block: number = forkBlockchain["_forkBlockNumber"].toNumber();
  return { url, block };
}
