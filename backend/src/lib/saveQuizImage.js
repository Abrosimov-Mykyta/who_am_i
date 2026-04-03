const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const IMAGES_DIR = path.join(__dirname, '../../public/quiz-images');

/**
 * Return a path-only URL so the client always joins REACT_APP_API_URL (never embeds localhost in JSON).
 * Optional API_PUBLIC_URL: if set, still return absolute URL for crawlers that need it without a browser.
 */
async function saveQuizImagePng(buffer) {
  await fs.mkdir(IMAGES_DIR, { recursive: true });
  const filename = `${crypto.randomUUID()}.png`;
  await fs.writeFile(path.join(IMAGES_DIR, filename), buffer);
  const pathOnly = `/quiz-images/${filename}`;

  const absoluteBase =
    process.env.API_PUBLIC_URL?.trim().replace(/\/$/, '') ||
    process.env.SERVER_PUBLIC_URL?.trim().replace(/\/$/, '');
  if (absoluteBase) {
    return `${absoluteBase}${pathOnly}`;
  }
  return pathOnly;
}

module.exports = { saveQuizImagePng };
