// We load the plugin here.
import { HardhatUserConfig } from "hardhat/types";

import "../../../src/index";

const config: HardhatUserConfig = {
  solidity: "0.7.3",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        enabled: true,
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
        blockNumber: 15588000,
      },
    },
  },
  liveFork: {
    txMatcher: (tx) => {
      return !!tx.to?.startsWith("0x11");
    },
    delay: 1000,
    forkBlockNumber: 15588001,
  },
};

export default config;
