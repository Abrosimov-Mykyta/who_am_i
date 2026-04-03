import hardhatEthers from '@nomicfoundation/hardhat-ethers';
import { defineConfig } from 'hardhat/config';
import 'dotenv/config';

function deployerAccounts() {
  const k = process.env.PRIVATE_KEY?.trim();
  if (!k) return [];
  const hex = k.startsWith('0x') ? k : `0x${k}`;
  return [hex];
}

export default defineConfig({
  plugins: [hardhatEthers],
  solidity: '0.8.28',
  networks: {
    amoy: {
      type: 'http',
      url: process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
      accounts: deployerAccounts(),
      chainId: 80002,
    },
  },
});
