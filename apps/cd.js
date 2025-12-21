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
  if (!fs.existsSync(newPath) || !fs.statSync(newPath).isDirectory()) {
    io.stderr(`cd: ${target}: No such directory\n`);
    return 1;
  }
  if (shell) {
    shell.env.OLDPWD = cwd;
    shell.cwd = newPath;
  }
  try {
    process.chdir(newPath);
  } catch (e) {
    io.stderr(`cd: failed to change directory: ${e.message}\n`);
    return 1;
  }
  return 0;
};
