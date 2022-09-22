import { extendConfig } from "hardhat/config";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    config.liveFork = {
      enabled: userConfig.liveFork?.enabled ?? true,
      txMatcher: userConfig.liveFork?.txMatcher,
      delay: userConfig.liveFork?.delay ?? 20000,
      forkBlockNumber: userConfig.liveFork?.forkBlockNumber ?? "auto",
    };
  }
);
