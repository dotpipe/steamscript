// protocol_app_template.js - Protocol-compliant event loop app for js_shell
// Features: pause/resume, depth-aware listeners, crash recovery, manifest-driven nesting

const renderDOM = require('./terminal_dom_renderer');

module.exports = async function(args, env) {
  // Manifest/environment
  const manifest = env && env.manifest ? env.manifest : { depth: 0, allowedDepths: [0] };
  let running = true;
  let paused = false;
  let listeners = [];

  function attachListeners(depth) {
    // Only attach listeners for current depth and allowed parents
    if (!manifest.allowedDepths.includes(depth)) return;
    const onKey = (str, key) => {
      if (!running || paused) return;
      if (key && key.name === 'q') {
        running = false;
        cleanup();
      }
      // ...other key handling...
    };
    process.stdin.on('keypress', onKey);
    listeners.push(onKey);
  }

  function detachListeners() {
    listeners.forEach(fn => process.stdin.removeListener('keypress', fn));
    listeners = [];
  }

  function pause() { paused = true; detachListeners(); }
  function resume() { paused = false; attachListeners(manifest.depth); }

  function cleanup() {
    detachListeners();
    if (env && typeof env.restorePrompt === 'function') env.restorePrompt();
    process.stdout.write('\n[App exited, returning to shell]\n');
  }

  async function loop() {
    try {
      attachListeners(manifest.depth);
      while (running) {
        // Render UI (example)
        const json = {
          type: 'window',
          title: 'Protocol App',
          width: 40,
          height: 10,
          children: [
            { type: 'text', content: 'Press q to exit.' }
          ]
        };
        renderDOM(json, env.stdout || (s => process.stdout.write(s)));
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (e) {
      cleanup();
    }
  }

  await loop();
  return { pause, resume, cleanup };
};
