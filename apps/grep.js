// grep.js - universal grep command (Node.js)
const fs = require('fs');
module.exports = function(args, io) {
    if (args.length < 2) return io.stderr('Usage: grep <pattern> <file>\n');
    const [pattern, file] = args;
    try {
        const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
        const re = new RegExp(pattern);
        lines.forEach(line => { if (re.test(line)) io.stdout(line + '\n'); });
    } catch (e) {
        io.stderr('grep: ' + file + ': ' + e.message + '\n');
    }
};

module.exports = async function grep(args, stdin, stdout, stderr) {
    stdin = stdin || (() => '');
    stdout = stdout || (() => {});
    stderr = stderr || (() => {});
    if (args.length < 1) {
        stderr('Usage: grep <pattern> [file ...]');
        stderr('You entered: grep ' + args.join(' '));
        return 1;
    }
    const pattern = args[0];
    const regex = new RegExp(pattern);
    const files = args.slice(1);
    let found = false;
    if (files.length === 0) {
        // Read from stdin
        let data = '';
        stdin((chunk) => { data += chunk; }, () => {
            data.split('\n').forEach(line => {
                if (regex.test(line)) {
                    stdout(line);
                    found = true;
                }
            });
            if (!found) return 1;
        });
        return 0;
    }
    for (const file of files) {
        try {
            const lines = fs.readFileSync(file, 'utf8').split('\n');
            lines.forEach(line => {
                if (regex.test(line)) {
                    stdout(line);
                    found = true;
                }
            });
        } catch (e) {
            stderr(`grep: ${e.message}`);
            return 1;
        }
    }
    return found ? 0 : 1;
};
