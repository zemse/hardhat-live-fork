# hardhat-live-fork

_Runs mainnet fork along with replaying mainnet txs._

When simulating a smart contract + UI on mainnet fork, everything else is paused, i.e. Chainlink oracles don't update. This plugin basically replays mainnet txs on the fork chain. Also to prevent replaying a lot of txs, a logic can be provided to filter only relevant txs for replaying.

## Installation

### Step 1: Install the plugin

Install `hardhat-live-fork` as well as `ethers` if not already.

```bash
npm install hardhat-live-fork ethers
```

### Step 2: Import the plugin in your `hardhat.config.js`:

```js
require("hardhat-live-fork");
```

or `hardhat.config.ts`:

```ts
import "hardhat-live-fork";
```

### Step 3: Configure mainnet fork

In hardhat.config.js:

```ts
const config: HardhatUserConfig = {
  solidity: "0.7.3",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        enabled: true,
        // provide an archive node url
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
      },
    },
  },
  liveFork: {
    txMatcher: (tx) => {
      // custom logic to match which txs to replay on LiveFork
      // e.g. only replay mainnet txs sent to this address
      return tx.to === "0x1234";
    },
  },
};

export default config;
```

### Step 4: Run the node

The following will start hardhat node along with replaying txs from mainnet (provided fork url). If you have any [hardhat-deploy](https://github.com/wighawag/hardhat-deploy) deploy scripts, it will also run them (so basically you can connect your frontend to it for alpha testing).

```
npx hardhat node
```

## Configuration

This plugin extends the `HardhatUserConfig` object and adds an optional `liveFork` property.

This is an example of how to set it:

```js
module.exports = {
  liveFork: {
    enabled: true, // default is true, you can disable it by setting to false
    txMatcher: (tx) => {
      // custom logic to match txs to replay on your live fork
      // e.g. only replay mainnet txs sent to a particular address
      return tx.to === "0x1234";
    },
    delay: 5000, // delay after iterations, default 20000ms
    forkBlockNumber: 'auto',
  },
};
```
