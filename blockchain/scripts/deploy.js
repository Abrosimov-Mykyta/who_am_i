import { network } from 'hardhat';

/**
 * Deploy WhoAmINFT to Polygon Amoy.
 *
 * Prerequisites:
 * - blockchain/.env with PRIVATE_KEY (deployer wallet with Amoy MATIC for gas)
 * - Optional: AMOY_RPC_URL, DEPLOY_MAX_SUPPLY (0 = unlimited), DEPLOY_MINT_PRICE_WEI (0 = free mint)
 *
 * Run: npm run deploy:amoy
 */
async function main() {
  const { ethers } = await network.connect();

  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error(
      'No deployer account. Add PRIVATE_KEY to blockchain/.env (64 hex chars, with or without 0x).'
    );
  }

  const deployer = signers[0];
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log('Deploying WhoAmINFT with:', deployer.address);
  console.log('Balance:', ethers.formatEther(balance), 'MATIC');

  if (balance === 0n) {
    console.warn('Warning: zero balance — fund this address with Amoy test MATIC before deploying.');
  }

  const maxSupply = BigInt(process.env.DEPLOY_MAX_SUPPLY ?? '0');
  const mintPrice = BigInt(process.env.DEPLOY_MINT_PRICE_WEI ?? '0');

  console.log('Constructor args: maxSupply =', maxSupply.toString(), ', mintPrice (wei) =', mintPrice.toString());

  const contract = await ethers.deployContract('WhoAmINFT', [maxSupply, mintPrice]);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('');
  console.log('✅ WhoAmINFT deployed to:', address);
  console.log('   Polygonscan:', `https://amoy.polygonscan.com/address/${address}`);
  console.log('');
  console.log('Add to who_am_i/.env (then restart npm start):');
  console.log(`REACT_APP_NFT_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
