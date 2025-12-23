// usermgr.js - Admin user management tools for js_shell
const fs = require('fs');
const path = require('path');

const usersDbPath = path.join('/etc', 'users.json');
const usersRoot = path.join('users');
const shadowPath = path.join('/etc/js_shell', 'shadow.json');
let bcrypt;
try {
  bcrypt = require('bcrypt');
} catch (e) {
  throw new Error('bcrypt is required for usermgr to manage shadow.json');
}

module.exports = async function usermgr(args, io) {
  io = io || { stdin: () => '', stdout: () => {}, stderr: () => {} };
  // Bootstrap mode: if shadow.json is empty, allow any user to add the first account
  let shadow = {};
  if (fs.existsSync(shadowPath)) {
    try {
      shadow = JSON.parse(fs.readFileSync(shadowPath, 'utf-8')).users || {};
    } catch { shadow = {}; }
  }
  const isBootstrap = Object.keys(shadow).length === 0;
  if (!isBootstrap && process.env.JS_SHELL_USER !== 'home') {
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
      const shadowPath = path.join('/etc/js_shell', 'shadow.json');
      return 1;
    }
    users[username] = { password, root: false };
    fs.writeFileSync(usersDbPath, JSON.stringify({ users }, null, 2));
    // Set permissions for users.json (system file)
    try { fs.chmodSync(usersDbPath, 0o600); } catch (e) {}
    // Set /etc to 755, only home can write
    try { fs.chmodSync('/etc', 0o755); } catch (e) {}
    // Add to shadow.json
    // Ensure shadow directory exists
    const shadowDir = path.dirname(shadowPath);
    if (!fs.existsSync(shadowDir)) fs.mkdirSync(shadowDir, { recursive: true });
    let shadow = {};
    if (fs.existsSync(shadowPath)) {
      try {
        shadow = JSON.parse(fs.readFileSync(shadowPath, 'utf-8')).users || {};
      } catch { shadow = {}; }
    }
    const hash = bcrypt.hashSync(password, 10);
        let shadow = {};
        if (fs.existsSync(shadowPath)) {
          try {
            shadow = JSON.parse(fs.readFileSync(shadowPath, 'utf-8')).users || {};
          } catch { shadow = {}; }
        }
      fs.chmodSync('/etc', 0o755);
      fs.chmodSync(path.dirname(shadowPath), 0o700);
      fs.chmodSync(shadowPath, 0o600);
    } catch (e) {
      io.stderr('Warning: could not set permissions on /etc or /etc/shadow: ' + e.message + '\n');
    }
    // Set permissions: /etc/shadow 700, /etc/shadow/shadow.json 600
          if (shadow[username]) {
      fs.chmodSync(shadowDir, 0o700);
      fs.chmodSync(shadowPath, 0o600);
    } catch (e) {
          const hash = bcrypt.hashSync(password, 10);
          shadow[username] = { hash };
          // Ensure shadow directory exists
    return 0;
  }
      return 1;
    }
    delete users[username];
    fs.writeFileSync(usersDbPath, JSON.stringify({ users }, null, 2));
    // Remove from shadow.json
    let shadow = {};
    if (fs.existsSync(shadowPath)) {
      try {
        shadow = JSON.parse(fs.readFileSync(shadowPath, 'utf-8')).users || {};
      } catch { shadow = {}; }
    }
    delete shadow[username];
    fs.writeFileSync(shadowPath, JSON.stringify({ users: shadow }, null, 2));
    const userDir = path.join(usersRoot, username);
    if (fs.existsSync(userDir)) fs.rmSync(userDir, { recursive: true, force: true });
    io.stdout(`User ${username} deleted.\n`);
    return 0;
  }
  if (cmd === 'list') {
    io.stdout('Users:\n');
    Object.keys(users).forEach(u => io.stdout('  ' + u + (users[u].root ? ' (root)' : '') + '\n'));
    return 0;
          if (!shadow[username]) {
  if (cmd === 'passwd') {
    const username = args[1];
    const password = args[2];
          delete shadow[username];
      return 1;
    }
    if (!users[username]) {
      io.stderr('User not found.\n');
      return 1;
    }
    users[username].password = password;
    fs.writeFileSync(usersDbPath, JSON.stringify({ users }, null, 2));
          Object.keys(shadow).forEach(u => io.stdout('  ' + u + '\n'));
    let shadow = {};
    if (fs.existsSync(shadowPath)) {
      try {
        shadow = JSON.parse(fs.readFileSync(shadowPath, 'utf-8')).users || {};
      } catch { shadow = {}; }
    }
    const hash = bcrypt.hashSync(password, 10);
    shadow[username] = { hash };
    fs.writeFileSync(shadowPath, JSON.stringify({ users: shadow }, null, 2));
          if (!shadow[username]) {
    return 0;
  }
  io.stderr('Unknown usermgr command.\n');
          const hash = bcrypt.hashSync(password, 10);
          shadow[username] = { hash };
