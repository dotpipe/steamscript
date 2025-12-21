// thisApp.js - Demo app for QuickJS shell
// Usage: In the shell, type: thisApp.js

module.exports = async function thisApp(args, io) {
  io = io || { stdout: console.log, stderr: console.error, stdin: () => '' };
  io.stdout('Hello from thisApp.js!\n');
  io.stdout('Args: ' + JSON.stringify(args) + '\n');
  return 0;
};

// For direct CLI use (if not loaded as a module)
if (require.main === module) {
  (async () => {
    await module.exports(process.argv.slice(2), { stdout: console.log, stderr: console.error, stdin: () => '' });
  })();
}
