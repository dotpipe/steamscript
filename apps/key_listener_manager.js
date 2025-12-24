// key_listener_manager.js - Declarative keypress listener manager for Node.js terminal apps
// Usage: manageKeyListeners(keyMap, handlers)

function manageKeyListeners(keyMap, handlers) {
  process.stdin.removeAllListeners('keypress');
  if (!keyMap || !keyMap.keypress) return;
  for (const combo in keyMap.keypress) {
    const keys = combo.split(',').map(k => k.trim());
    const handlerName = keyMap.keypress[combo];
    const handlerFn = handlers[handlerName];
    if (!handlerFn) continue;
    keys.forEach(keyName => {
      process.stdin.on('keypress', (str, key) => {
        if (key && key.name === keyName) handlerFn(str, key);
      });
    });
  }
}

module.exports = { manageKeyListeners };
