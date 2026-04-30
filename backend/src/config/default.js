const env = require('./dotenv');

module.exports = {
  server: {
    port: env.PORT || 3001,
    host: env.HOST || 'localhost',
  },
  huggingface: {
    apiKey: env.HUGGINGFACE_API_KEY,
    imageModel: env.HUGGINGFACE_IMAGE_MODEL || 'black-forest-labs/FLUX.1-schnell',
  },
  anthropic: {
    apiKey: env.ANTHROPIC_API_KEY,
  },
  ipfs: {
    node: env.IPFS_NODE || 'https://ipfs.infura.io:5001',
    gateway: env.IPFS_GATEWAY || 'https://ipfs.io/ipfs',
  },
  nft: {
    contractAddress: env.NFT_CONTRACT_ADDRESS,
    network: env.NETWORK || 'amoy',
  },
};
