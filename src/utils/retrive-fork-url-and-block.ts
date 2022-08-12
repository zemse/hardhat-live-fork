import { parseEther } from "ethers/lib/utils";
import { ForkBlockchain } from "hardhat/internal/hardhat-network/provider/fork/ForkBlockchain";
import { HardhatNetworkProvider } from "hardhat/internal/hardhat-network/provider/provider";

export async function retrieveForkUrlAndBlock(
  provider: HardhatNetworkProvider
) {
  if (provider["_node"] === undefined) {
    await provider["_init"]();
  }
  const forkBlockchain = provider["_node"]?.["_blockchain"];

  if (!(forkBlockchain instanceof ForkBlockchain)) {
    throw new Error("Provider has not been initialised with forkConfig");
  }
  const forkUrl: string =
    forkBlockchain["_jsonRpcClient"]["_httpProvider"]["_url"];
  const forkBlock: number = forkBlockchain["_forkBlockNumber"].toNumber();
  return { forkUrl, forkBlock };
}
