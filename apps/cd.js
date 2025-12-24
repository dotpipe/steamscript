// cd.js - Change directory command for js_shell
const path = require('path');
const fs = require('fs');

module.exports = function cd(args, io, shell) {
  let target = args[0];
  if (!target || target === '~') {
    target = (shell && shell.env && shell.env.HOME) || (shell && shell.homeDir) || '.';
  }
  if (target === '-') {
    if (shell && shell.env && shell.env.OLDPWD) {
      target = shell.env.OLDPWD;
      io.stdout(target + '\n');
    } else {
      io.stderr('cd: OLDPWD not set\n');
      return 1;
    }
  }
  const cwd = (shell && shell.cwd) ? shell.cwd : process.cwd();
  const newPath = path.resolve(cwd, target);
  // Jail non-home users to their home directory
  const user = process.env.JS_SHELL_USER;
  if (user !== 'home') {
    // Use absolute path for homeDir jail
    const usersRoot = require('path').resolve(__dirname, '../users');
    const homeDir = path.join(usersRoot, user);
    if (!newPath.startsWith(homeDir)) {
      io.stderr(`cd: access denied: ${target}\n`);
      return 1;
    }
  }
  if (!fs.existsSync(newPath) || !fs.statSync(newPath).isDirectory()) {
    io.stderr(`cd: ${target}: No such directory\n`);
    return 1;
  }
  if (shell) {
    shell.env.OLDPWD = cwd;
    shell.cwd = newPath;
  }
  const { addAlertFromException } = require('./htodo_alert');
  try {
    process.chdir(newPath);
  } catch (e) {
    io.stderr(`cd: failed to change directory: ${e.message}\n`);
    addAlertFromException('cd', e);
    return 1;
  }
  return 0;
};
