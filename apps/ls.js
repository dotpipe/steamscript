// ls.js - list directory contents with -l, -a, -h, -t, -r options (Node.js)
const fs = require('fs');
const path = require('path');
const glob = require('glob');
function isAllowed(dir) {
  const user = process.env.JS_SHELL_USER;
  if (user === 'home') return true;
  const homeDir = path.resolve('users', user);
  const abs = path.resolve(dir);
  // Allow system files (apps, shell core)
  if (abs.startsWith(path.resolve('apps')) || abs === path.resolve('js_shell.js')) return true;
  return abs.startsWith(homeDir);
}
module.exports = function(args, io) {
	let dir = '.';
	let long = false, all = false, human = false, sortTime = false, reverse = false;
	let nonOptions = [];
	args.forEach(arg => {
		if (arg === '-l') long = true;
		else if (arg === '-a') all = true;
		else if (arg === '-h') human = true;
		else if (arg === '-t') sortTime = true;
		else if (arg === '-r') reverse = true;
		else if (!arg.startsWith('-')) nonOptions.push(arg);
	});
	// Wildcard/glob support
	let useGlob = false;
	let globPattern = null;
	if (nonOptions.length > 0) {
		if (nonOptions[nonOptions.length - 1].includes('*') || nonOptions[nonOptions.length - 1].includes('?')) {
			useGlob = true;
			globPattern = nonOptions[nonOptions.length - 1];
		} else {
			dir = nonOptions[nonOptions.length - 1];
		}
	}
	if (!isAllowed(dir)) {
	  io.stderr('ls: access denied: ' + dir + '\n');
	  return;
	}
	function humanSize(bytes) {
		if (bytes < 1024) return bytes + 'B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'K';
		if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + 'M';
		return (bytes / (1024 * 1024 * 1024)).toFixed(1) + 'G';
	}
	try {
		let files;
		if (useGlob) {
			files = glob.sync(globPattern, { dot: all, nodir: false }).map(f => {
				let stat;
				try { stat = fs.statSync(f); } catch { stat = null; }
				return { name: f, stat, isDir: stat ? stat.isDirectory() : false };
			});
		} else {
			files = fs.readdirSync(dir, { withFileTypes: true });
			if (!all) files = files.filter(f => !f.name.startsWith('.'));
			files = files.map(f => {
				const full = path.join(dir, f.name);
				let stat;
				try { stat = fs.statSync(full); } catch { stat = null; }
				return { name: f.name, stat, isDir: f.isDirectory() };
			});
		}
		let fileStats = files;
		if (sortTime) fileStats.sort((a, b) => (b.stat?.mtimeMs || 0) - (a.stat?.mtimeMs || 0));
		else fileStats.sort((a, b) => a.name.localeCompare(b.name));
		if (reverse) fileStats.reverse();
		if (!long) {
			io.stdout(fileStats.map(f => f.name).join('\t') + '\n');
		} else {
			fileStats.forEach(f => {
				if (!f.stat) return;
				const perms = (f.isDir ? 'd' : '-') +
					((f.stat.mode & 0o400) ? 'r' : '-') + ((f.stat.mode & 0o200) ? 'w' : '-') + ((f.stat.mode & 0o100) ? 'x' : '-') +
					((f.stat.mode & 0o040) ? 'r' : '-') + ((f.stat.mode & 0o020) ? 'w' : '-') + ((f.stat.mode & 0o010) ? 'x' : '-') +
					((f.stat.mode & 0o004) ? 'r' : '-') + ((f.stat.mode & 0o002) ? 'w' : '-') + ((f.stat.mode & 0o001) ? 'x' : '-');
				const size = human ? humanSize(f.stat.size).padStart(8, ' ') : f.stat.size.toString().padStart(8, ' ');
				const mtime = f.stat.mtime.toISOString().replace('T', ' ').slice(0, 19);
				io.stdout(`${perms} ${size} ${mtime} ${f.name}\n`);
			});
		}
	} catch (e) {
		io.stderr('ls: ' + e.message + '\n');
	}
};