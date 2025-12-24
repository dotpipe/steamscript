// example_modal_app.js - Example app using modal.js for ncurses-like UI
const modal = require('./modal');

module.exports = async function(args, io, env) {
  const items = ['Open Sub-Modal', 'Say Hello', 'Exit'];
  function onKey(key, cursor, env, launchSubModal) {
    if (key === 'enter') {
      if (cursor === 0) {
        // Launch a sub-modal recursively
        launchSubModal({
          title: 'Sub-Modal',
          content: ['Nested Option 1', 'Nested Option 2', 'Back'],
          onKey: (k, c, e, launch) => {
            if (k === 'enter' && c === 2) {
              // Back to parent modal
              return;
            }
          },
          env: { depth: (env && env.depth ? env.depth + 1 : 1) }
        });
      } else if (cursor === 1) {
        io.stdout('Hello from modal!\n');
      } else if (cursor === 2) {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeAllListeners('data');
      }
    }
  }
  await modal({
    title: 'Main Modal',
    content: items,
    onKey,
    env: env || { depth: 0 }
  }, () => {
    io.stdout('Exited modal.\n');
  });
};
