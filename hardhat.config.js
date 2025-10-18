require("@nomicfoundation/hardhat-toolbox");
require("@fhevm/hardhat-plugin");
require("dotenv").config();

const { PRIVATE_KEY, INFURA_API_KEY, SEPOLIA_RPC_URL } = process.env;

function getSepoliaAccounts() {
  const key = PRIVATE_KEY ? PRIVATE_KEY.trim() : "";
  if (/^0x[0-9a-fA-F]{64}$/.test(key)) {
    return [key];
  }
  return [];
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.25",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
      evmVersion: "cancun",
    },
  },
  networks: {
    // Sepolia testnet with FHEVM support (when available)
    sepolia: {
      url: SEPOLIA_RPC_URL || (INFURA_API_KEY ? `https://sepolia.infura.io/v3/${INFURA_API_KEY}` : "https://sepolia.infura.io/v3/"),
      accounts: getSepoliaAccounts(),
      chainId: 11155111,
    },
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
