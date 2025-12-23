// regenkey.js - Regenerate the user's .shellkey and public identity token
// Usage: run from the shell as a privileged user or as the user themselves

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function regenKey(userHomeDir) {
  const keyFilePath = path.join(userHomeDir, '.shellkey');
  // Generate a new random key
  const newKey = crypto.randomBytes(32).toString('hex');
  // Write the new key to .shellkey (envelope)
  fs.writeFileSync(keyFilePath, newKey + '\n', { mode: 0o600 });
  // Compute and write the new public hash
  let keyHash;
  try {
    const keyBytes = Buffer.from(newKey, 'hex');
    keyHash = crypto.createHash('sha256').update(keyBytes).digest('hex');
  } catch (e) {
    keyHash = crypto.createHash('sha256').update(newKey, 'utf-8').digest('hex');
  }
  fs.writeFileSync(keyFilePath, keyHash + '\n', { mode: 0o600 });
  console.log('New .shellkey and public token generated.');
  console.log('Your new public identity token (first 15):', keyHash.slice(0, 15));
}

// Main: run for current user or specified user
const userHome = process.env.HOME || process.env.USERPROFILE || path.join(__dirname, 'users', 'home');
regenKey(userHome);
