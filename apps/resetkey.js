// resetkey.js - Admin command to reset a user's shell key
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

module.exports = async function resetkey(args, io) {
  io = io || { stdin: () => '', stdout: () => {}, stderr: () => {} };
  if (process.env.JS_SHELL_USER !== 'home') {
    io.stderr('Only the home user (admin) can reset keys.\n');
    return 1;
  }
  const username = args[0];
  if (!username) {
    io.stderr('Usage: resetkey <username>\n');
    return 1;
  }
  const userDir = path.join('users', username);
  if (!fs.existsSync(userDir)) {
    io.stderr('User directory not found.\n');
    return 1;
  }
  const key = crypto.randomBytes(32).toString('hex');
  const keyPath = path.join(userDir, '.shellkey');
  fs.writeFileSync(keyPath, key + '\n', { mode: 0o600 });
  io.stdout(`New key for ${username}: ${key}\n`);
  io.stdout(`Saved to ${keyPath}\n`);
  return 0;
}
