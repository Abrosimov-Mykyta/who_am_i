const dotenv = require('dotenv');
const path = require('path');

// Завантажуємо змінні оточення з .env файлу
dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

module.exports = process.env; 