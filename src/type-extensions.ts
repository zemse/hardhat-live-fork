// If your plugin extends types from another plugin, you should import the plugin here.

// To extend one of Hardhat's types, you need to import the module where it has been defined, and redeclare it.
import "hardhat/types/config";
import "hardhat/types/runtime";
import { TxMatcher } from "./utils";

// import { ExampleHardhatRuntimeEnvironmentField } from "./ExampleHardhatRuntimeEnvironmentField";

declare module "hardhat/types/config" {
  // This is an example of an extension to one of the Hardhat config values.

  export interface HardhatUserConfig {
    liveFork: {
      enabled?: boolean;
      txMatcher?: TxMatcher;
      delay?: number;
    };
  }

  export interface HardhatConfig {
    liveFork: {
      enabled: boolean;
      txMatcher?: TxMatcher;
      delay: number;
    };
  }
}
