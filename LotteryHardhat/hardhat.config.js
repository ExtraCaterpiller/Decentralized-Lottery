require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()
require('hardhat-deploy')
require('hardhat-contract-sizer')

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {version: "0.8.4"},
      {version: "0.8.19"},
      {version: "0.8.0"}
    ]
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URl,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY],
      chainId: 11155111,
      timeout: 30000,
      blockConfirmations: 6
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337
    }
  },
  gasReporter: {
    enabled: false,
    currency: 'USD',
    //outputFile: 'gas-reporter.txt',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    }
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY
    }
  },
  mocha: {
    timeout: 300000
  },
};
