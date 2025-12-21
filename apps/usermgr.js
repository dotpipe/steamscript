// usermgr.js - Admin user management tools for js_shell
const fs = require('fs');
const path = require('path');

const usersDbPath = path.join('users.json');
const usersRoot = path.join('users');

module.exports = async function usermgr(args, io) {
  io = io || { stdin: () => '', stdout: () => {}, stderr: () => {} };
  if (process.env.JS_SHELL_USER !== 'home') {
    io.stderr('Only the home user (admin) can manage users.\n');
    return 1;
  }
  const cmd = args[0];
  if (!cmd) {
    io.stdout('usermgr <add|del|list|passwd> [username] [password]\n');
    return 0;
  }
  let users = {};
  if (fs.existsSync(usersDbPath)) {
    users = JSON.parse(fs.readFileSync(usersDbPath, 'utf-8')).users || {};
  }
  if (cmd === 'add') {
    const username = args[1];
    const password = args[2];
    if (!username || !password) {
      io.stderr('Usage: usermgr add <username> <password>\n');
      return 1;
    }
    if (users[username]) {
      io.stderr('User already exists.\n');
      return 1;
    }
    users[username] = { password, root: false };
    fs.writeFileSync(usersDbPath, JSON.stringify({ users }, null, 2));
    const userDir = path.join(usersRoot, username);
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
    io.stdout(`User ${username} added.\n`);
    return 0;
  }
  if (cmd === 'del') {
    const username = args[1];
    if (!username) {
      io.stderr('Usage: usermgr del <username>\n');
      return 1;
    }
    if (!users[username]) {
      io.stderr('User not found.\n');
      return 1;
    }
    delete users[username];
    fs.writeFileSync(usersDbPath, JSON.stringify({ users }, null, 2));
    const userDir = path.join(usersRoot, username);
    if (fs.existsSync(userDir)) fs.rmSync(userDir, { recursive: true, force: true });
    io.stdout(`User ${username} deleted.\n`);
    return 0;
  }
  if (cmd === 'list') {
    io.stdout('Users:\n');
    Object.keys(users).forEach(u => io.stdout('  ' + u + (users[u].root ? ' (root)' : '') + '\n'));
    return 0;
  }
  if (cmd === 'passwd') {
    const username = args[1];
    const password = args[2];
    if (!username || !password) {
      io.stderr('Usage: usermgr passwd <username> <newpassword>\n');
      return 1;
    }
    if (!users[username]) {
      io.stderr('User not found.\n');
      return 1;
    }
    users[username].password = password;
    fs.writeFileSync(usersDbPath, JSON.stringify({ users }, null, 2));
    io.stdout(`Password updated for ${username}.\n`);
    return 0;
  }
  io.stderr('Unknown usermgr command.\n');
  return 1;
}
