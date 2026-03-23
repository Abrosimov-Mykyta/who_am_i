import hre from 'hardhat';
import { ethers } from 'ethers';

async function main() {
  console.log('Deploying WhoAmINFT contract...');

  const provider = new ethers.JsonRpcProvider(
    process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology'
  );
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log('Deploying with account:', wallet.address);

  const balance = await provider.getBalance(wallet.address);
  console.log('Account balance:', ethers.formatEther(balance), 'MATIC');

  // Читаємо артефакт контракту
  const artifact = await hre.artifacts.readArtifact('WhoAmINFT');

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy(0, 0);

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('✅ WhoAmINFT deployed to:', address);
  console.log('');
  console.log('Add this to your backend .env:');
  console.log(`NFT_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });