const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const IMAGES_DIR = path.join(__dirname, '../../public/quiz-images');

/**
 * Persist PNG bytes and return a public HTTP URL for NFT metadata (keeps on-chain tokenURI small).
 */
async function saveQuizImagePng(buffer) {
  await fs.mkdir(IMAGES_DIR, { recursive: true });
  const filename = `${crypto.randomUUID()}.png`;
  await fs.writeFile(path.join(IMAGES_DIR, filename), buffer);
  const base = (process.env.API_PUBLIC_URL || 'http://localhost:3001').replace(/\/$/, '');
  return `${base}/quiz-images/${filename}`;
}

module.exports = { saveQuizImagePng };
