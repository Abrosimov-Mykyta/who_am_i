import '@nomicfoundation/hardhat-ethers';
import 'dotenv/config';

export default {
  solidity: '0.8.28',
  networks: {
    amoy: {
      type: 'http',
      url: process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002,
    },
  },
};