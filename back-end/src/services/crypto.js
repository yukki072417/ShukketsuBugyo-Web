const crypto = require('crypto');
const fs = require('fs');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

// 鍵ファイルのパス（VPS上の安全なディレクトリに設置）
const keyPath = process.env.AES_KEY_PATH || '/app/secrets/aes.key';

function loadKey(filePath) {
  try {
    const hex = fs.readFileSync(filePath, 'utf8').trim();
    const keyBuffer = Buffer.from(hex, 'hex');
    if (keyBuffer.length !== 32) {
      throw new Error('Invalid key length. Key must be 32 bytes (256 bits) for aes-256-cbc.');
    }
    return keyBuffer;
  } catch (err) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`FATAL: AES key could not be loaded from ${filePath}. Application cannot start in production without a valid key.`);
      throw err; // Crash the application
    } else {
      console.warn(`AES key not found or invalid at ${filePath}. Using dummy key for non-production environment. DO NOT USE IN PRODUCTION.`);
      const envKey = process.env.AES_FALLBACK_KEY;
      if (!envKey) {
        throw new Error('AES key not found in file or environment variable. Set AES_FALLBACK_KEY environment variable.');
      }
      return Buffer.from(envKey, 'hex');
    }
  }
}


const key = loadKey(keyPath);

function encryptAES(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  // IVを暗号文の前に付けて、デコード時に使えるようにする
  return iv.toString('base64') + ':' + encrypted;
}

function decryptAES(encryptedText) {
  const textParts = encryptedText.split(':');
  if (textParts.length !== 2) {
    throw new Error('Invalid encrypted text format. Expected "iv:ciphertext".');
  }
  const iv = Buffer.from(textParts.shift(), 'base64');
  const encrypted = textParts.join(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function generateHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

module.exports = { encryptAES, decryptAES, generateHash };