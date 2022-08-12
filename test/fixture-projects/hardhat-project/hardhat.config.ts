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
      },
    },
  },
  liveFork: {
    txMatcher: (tx) => {
      return !!tx.to?.startsWith("0x1");
    },
  },
};

export default config;
