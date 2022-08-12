import { ethers } from "ethers";
import { HardhatNetworkProvider } from "hardhat/internal/hardhat-network/provider/provider";
import { hexValue } from "./hex-value";

export async function impersonateAccount(
  provider: HardhatNetworkProvider,
  address: string
) {
  return await provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });
}

export async function fundBalance(
  provider: HardhatNetworkProvider,
  address: string
) {
  return await provider.request({
    method: "hardhat_setBalance",
    params: [
      address,
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    ],
  });
}

export async function sendTx(
  provider: HardhatNetworkProvider,
  tx: ethers.providers.TransactionResponse
) {
  return await provider.request({
    method: "eth_sendTransaction",
    params: [
      {
        from: tx.from,
        to: tx.to,
        value: hexValue(tx.value.toHexString()),
        data: tx.data,
        gas: hexValue(tx.gasLimit.toHexString()),
        gasPrice: hexValue(tx.gasPrice?.toHexString() ?? "0x0"),
      },
    ],
  });
}
