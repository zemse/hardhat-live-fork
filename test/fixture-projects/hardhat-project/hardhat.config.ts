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
        url: `https://arb-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
        blockNumber: 20000149,
      },
    },
  },
  liveFork: {
    txMatcher: (tx) => {
      return !!tx.to?.startsWith("0x11");
    },
    delay: 1000,
  },
};

export default config;
