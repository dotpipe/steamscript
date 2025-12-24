// core/Shell.js - Hierarchical, reusable Shell class
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const bcrypt = require('bcrypt');

class Shell {
    // Simulate dashboard alerts/feedback (replace with real logic as needed)
    dashboardAlert = false;

    checkDashboardAlerts() {
        // TODO: Replace with real alert/feedback check
        // For demo, randomly set alert true/false
        this.dashboardAlert = Math.random() < 0.5;
    }

    runDashboard() {
        const thin = require('../thin_components');
        const dashboardPath = path.join(this.baseDir, 'dashboard.json');
        const feedbackPath = path.join(this.baseDir, 'dashboard_feedback.json');
        let node;
        let feedbackData = { alerts: [], feedback: [] };
        try {
            node = JSON.parse(fs.readFileSync(dashboardPath, 'utf-8'));
        } catch (e) {
            console.log('Could not load dashboard.json:', e.message);
            return;
        }
        try {
            feedbackData = JSON.parse(fs.readFileSync(feedbackPath, 'utf-8'));
        } catch {}
        // Template replacement for alerts/feedback in dashboard
        function injectData(obj) {
            if (typeof obj === 'string') {
                return obj.replace(/\{\{alerts\}\}/g, feedbackData.alerts.map(a => `[${a.type}] ${a.message}`).join('\n'))
                          .replace(/\{\{feedback\}\}/g, feedbackData.feedback.map(f => `${f.user}: ${f.message}`).join('\n'));
            } else if (Array.isArray(obj)) {
                return obj.map(injectData);
            } else if (typeof obj === 'object' && obj !== null) {
                const out = {};
                for (const k in obj) out[k] = injectData(obj[k]);
                return out;
            }
            return obj;
        }
        node = injectData(node);
        // Always resume shell prompt after dashboard exits, regardless of how it exits
        const resumeShell = () => {
            this.setupKeyBindings();
            this.startLoop();
        };
        thin.interactiveJsonNode(
            node,
            {
                exitByF12: resumeShell,
                exitToShell: resumeShell,
                f12Owner: true // Only the top-level dashboard handles F12
            },
            thin.interactiveJsonNode, // renderJsonUI
            this.setupKeyBindings.bind(this),
            this.showPrompt.bind(this)
        );
    }

    parseArgs(cmdline) {
        // Simple parser: splits command, options (starting with -), and positional args
        const parts = cmdline.trim().split(/\s+/);
        const cmd = parts[0];
        const options = parts.filter(p => p.startsWith('-'));
        const args = parts.filter(p => !p.startsWith('-') && p !== cmd);
        return { cmd, options, args };
    }

    showPrompt() {
        this.checkDashboardAlerts();
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const timeStr = `[${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}]`;
        let cwd = process.cwd();
        let relPath = '';
        let promptStr = '';
        // Determine if user is default (no home dir or home is project root)
        const isDefaultUser = !this.userHomeDir || this.userHomeDir === this.baseDir;
        let dot = isDefaultUser ? '' : '.';
        if (!isDefaultUser && this.dashboardAlert) {
            dot = '\x1b[32m●\x1b[0m'; // green dot
        }
        if (isDefaultUser) {
            relPath = path.relative(this.userHomeDir || this.baseDir, cwd) || '.';
            promptStr = `${timeStr} ${relPath}% `;
        } else {
            relPath = path.relative(this.baseDir, cwd) || '.';
            promptStr = `${dot}${timeStr} ${relPath}% `;
        }
        process.stdout.write(promptStr);
    }

    startLoop() {
        // Disable global key handler for prompt loop
        if (process.stdin._globalKeyHandlerInstalled) {
            process.stdin.removeAllListeners('data');
            // Do not setRawMode(false) here; let readline manage input mode
            process.stdin._globalKeyHandlerInstalled = false;
        }
        this.readline = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '' // Prevent default '>' prompt
        });
        const showPrompt = () => {
            this.showPrompt();
        };
        this.readline.on('line', (line) => {
            if (!this.handleCommand(line.trim())) {
                showPrompt();
            }
        });
        showPrompt();
    }

            handleCommand(cmdline) {
                if (!cmdline) return false;
                const { cmd, options, args } = this.parseArgs(cmdline);
                if (cmd === 'exit') {
                    this.readline.close();
                    this.closeProgram();
                    return true;
                }
                if (cmd === 'pwd') {
                    // Example: pwd -L (logical) or -P (physical), but here just print cwd
                    console.log(process.cwd());
                    return false;
                }
                if (cmd === 'ls') {
                    const cwd = process.cwd();
                    let pattern = args[0] || '*';
                    let long = options.includes('-l');
                    try {
                        const glob = require('glob');
                        const files = glob.sync(pattern, { cwd });
                        for (const f of files) {
                            if (long) {
                                try {
                                    const stat = fs.statSync(path.join(cwd, f));
                                    const size = stat.size.toString().padStart(8, ' ');
                                    const mtime = stat.mtime.toISOString().slice(0, 19).replace('T', ' ');
                                    const type = stat.isDirectory() ? 'd' : '-';
                                    console.log(`${type} ${size} ${mtime} ${f}`);
                                } catch {
                                    console.log(`?         ?                 ? ${f}`);
                                }
                            } else {
                                console.log(f);
                            }
                        }
                    } catch (e) {
                        console.log('ls: error:', e.message);
                    }
                    return false;
                }
                if (cmd === 'cd') {
                    const target = args[0];
                    if (!target) {
                        console.log('cd: missing operand');
                        return false;
                    }
                    try {
                        process.chdir(target);
                    } catch (e) {
                        console.log('cd: no such file or directory:', target);
                    }
                    return false;
                }
                if (cmd === 'dashboard' || cmd === 'ds') {
                    this.readline.close();
                    this.runDashboard();
                    return true;
                }
                // Unknown command
                console.log(`Unknown command: ${cmdline}`);
                return false;
            }
        showPrompt() {
            const now = new Date();
            const pad = n => n.toString().padStart(2, '0');
            const timeStr = `[${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}]`;
            let cwd = process.cwd();
            let relPath = '';
            let promptStr = '';
            // Determine if user is default (no home dir or home is project root)
            const isDefaultUser = !this.userHomeDir || this.userHomeDir === this.baseDir;
            if (isDefaultUser) {
                relPath = path.relative(this.userHomeDir || this.baseDir, cwd) || '.';
                promptStr = `${timeStr} ${relPath}% `;
            } else {
                relPath = path.relative(this.baseDir, cwd) || '.';
                promptStr = `.${timeStr} ${relPath}% `;
            }
            process.stdout.write(promptStr);
        }
    static instances = [];

    constructor(baseDir) {
        this.baseDir = baseDir || process.cwd();
        this.appsDir = path.join(this.baseDir, 'apps');
        this.osAppsDir = path.join(this.baseDir, 'os', 'apps');
        this.usersDb = require(path.join(this.baseDir, 'users1.json'));
        this.permissionsDb = require(path.join(this.baseDir, 'permissions.json'));
        this.shadowDb = require(path.join(this.baseDir, 'shadow', 'shadow.json'));
        this.currentUser = null;
        this.isHomeUser = false;
        this.userPerms = null;
        this.userRoot = false;
        this.userAllowedDirs = [];
        this.userDeniedDirs = [];
        this.userAllowedCmds = [];
        this.userDeniedCmds = [];
        this.userHomeDir = null;
        this.promptWasShown = false;
        this.uiExitedByF12 = false;
        this.globalReadline = null;
        this.currentKeyHandler = null;
        this.keybindingsActive = false;
        Shell.instances.push(this);
        // Do not install global key handler by default; only enable for special UI
    }

    static closeInstance(instance) {
        const idx = Shell.instances.indexOf(instance);
        if (idx !== -1) {
            Shell.instances.splice(idx, 1);
            instance.disableKeyBindings();
        }
    }

    static closeAll() {
        for (const inst of Shell.instances) inst.disableKeyBindings();
        Shell.instances = [];
    }

    setupKeyBindings() {
        this.enableKeyBindings();
    }

    enableKeyBindings() {
        if (!this.keybindingsActive) {
            this.keybindingsActive = true;
            // Attach listeners for this instance (stub)
            // e.g., process.stdin.on('data', ...)
        }
    }

    disableKeyBindings() {
        if (this.keybindingsActive) {
            this.keybindingsActive = false;
            // Remove listeners for this instance (stub)
            // e.g., process.stdin.removeListener('data', ...)
        }
    }

    openProgram(appName, args) {
        // Create a new Shell instance for the program
        const instance = new Shell(this.baseDir);
        instance.setupKeyBindings();
        instance.startLoop();
        // ...load and run the app logic here...
        return instance;
    }

    closeProgram() {
        Shell.closeInstance(this);
    }
    installGlobalKeyHandler() {
        if (process.stdin._globalKeyHandlerInstalled) return;
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.removeAllListeners('data');
        process.stdin.on('data', (data) => {
            const key = data.toString('utf8');
            // Always allow F12 to launch htodo.json
            if (key === '\u001b[24~') {
                process.stdin.removeAllListeners('data');
                process.stdin.setRawMode(false);
                process.stdin.pause();
                (async () => {
                    const fileIO = require(path.join(this.baseDir, 'utils', 'fileIO.async.js'));
                    const htodoPath = path.join(this.appsDir, 'htodo.json');
                    if (fs.existsSync(htodoPath)) {
                        try {
                            let htodoData = await fileIO.readJson(htodoPath);
                            htodoData.showPrompt = false;
                            let todos = [];
                            let sources = htodoData.dataSource || 'todo.json';
                            let allData = [];
                            const projectRoot = path.resolve(this.baseDir);
                            function normalizePath(p) {
                                if (p.startsWith('/mnt/c/')) {
                                    return 'c:/' + p.slice('/mnt/c/'.length).replace(/\//g, '/');
                                }
                                if (p.startsWith('/')) {
                                    return path.join(projectRoot, p.slice(1));
                                }
                                return path.join(projectRoot, p);
                            }
                            if (Array.isArray(sources)) {
                                const promises = sources.map(async src => {
                                    const filePath = normalizePath(src);
                                    if (fs.existsSync(filePath)) {
                                        if (src.endsWith('.json')) {
                                            let parsed = await fileIO.readJson(filePath);
                                            if (Array.isArray(parsed)) return parsed;
                                            else return [parsed];
                                        } else if (src.endsWith('.csv')) {
                                            let parsed = await fileIO.readCsv(filePath);
                                            return parsed;
                                        }
                                    }
                                    return [];
                                });
                                const results = await Promise.all(promises);
                                allData = results.flat();
                                todos = allData;
                            } else {
                                const filePath = normalizePath(sources);
                                if (sources.endsWith('.json')) {
                                    todos = await fileIO.readJson(filePath) || [];
                                } else if (sources.endsWith('.csv')) {
                                    todos = await fileIO.readCsv(filePath) || [];
                                }
                            }
                            if (typeof htodoData.options === 'string' && htodoData.options.trim() === '[{{todos}}]') {
                                htodoData.options = todos;
                            }
                            const tmpPath = htodoPath + '.tmp';
                            await fileIO.writeJson(tmpPath, htodoData);
                            // process.stdout.write('[DEBUG] Loaded todos: ' + JSON.stringify(todos, null, 2) + '\n');
                            this.runJsonAppPathWithData(tmpPath);
                            fs.unlinkSync(tmpPath);
                        } catch (e) {
                            process.stdout.write('[ERROR] Failed to launch htodo: ' + e.message + '\n');
                            this.setupKeyBindings();
                            this.showPrompt();
                        }
                    } else {
                        process.stdout.write('[ERROR] htodo.json not found in /apps\n');
                        this.setupKeyBindings();
                        this.showPrompt();
                    }
                })();
                return;
            }
            // Remove global debug keypress output during login
            if (typeof this.currentKeyHandler === 'function') {
                this.currentKeyHandler(data);
            }
        });
        process.stdin._globalKeyHandlerInstalled = true;
    }

    // ...migrate all other methods from js1_shell.js, updating all __dirname and path references to use this.baseDir...

    async loginPrompt(callback) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: true
        });
        rl.question('Username: ', (username) => {
            rl.question('Password: ', (password) => {
                rl.close();
                const user = this.usersDb.users && this.usersDb.users[username];
                if (!user) {
                    console.log('Invalid username.');
                    return this.loginPrompt(callback);
                }
                const shadowEntry = this.shadowDb[username];
                if (!shadowEntry) {
                    console.log('No password set for this user.');
                    return this.loginPrompt(callback);
                }
                // Debug output removed after troubleshooting
                bcrypt.compare(password, shadowEntry, (err, res) => {
                    if (err) {
                        console.log('[DEBUG] bcrypt error:', err);
                    }
                    if (!res) {
                        console.log('Invalid password.');
                        return this.loginPrompt(callback);
                    }
                    this.currentUser = username;
                    this.userPerms = (this.permissionsDb.users && this.permissionsDb.users[username]) || {};
                    this.userHomeDir = user.home || null;
                    this.userRoot = !!user.root;
                    console.log(`Welcome, ${username}!`);
                    if (typeof callback === 'function') callback();
                });
            });
        });
    }
}

module.exports = Shell;
