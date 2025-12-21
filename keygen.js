// keygen.js - Generate a new SHA256 key for a user
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const user = process.argv[2];
if (!user) {
  console.error('Usage: node keygen.js <username>');
  process.exit(1);
}
const key = crypto.randomBytes(32).toString('hex');
const keyPath = path.join('users', user, '.shellkey');
fs.mkdirSync(path.dirname(keyPath), { recursive: true });
fs.writeFileSync(keyPath, key + '\n', { mode: 0o600 });
console.log(`Key for ${user}: ${key}`);
console.log(`Saved to ${keyPath}`);
