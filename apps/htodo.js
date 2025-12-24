// Use external key listener manager
const { manageKeyListeners } = require('./key_listener_manager');
// htodo.js - Futureproofed TODO and feedback dashboard for js_shell
// Centralized, context-driven key binding, robust listener management, extensible for child apps

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');
const renderDOM = require('./terminal_dom_renderer');

const COMMENTS_FILE = path.join(__dirname, '..', 'comments.json');
const TODO_FILE = path.join(__dirname, '..', 'todo.json');

function loadComments() {
  if (!fs.existsSync(COMMENTS_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(COMMENTS_FILE, 'utf-8')); } catch (e) {
    addAlertFromException('comments.json', e);
    return {};
  }
}


function loadTodos() {
  if (!fs.existsSync(TODO_FILE)) return [];
  try {
    let todos = JSON.parse(fs.readFileSync(TODO_FILE, 'utf-8'));
    // Ensure thread and threadStatus property exists for each todo
    todos.forEach(todo => {
      if (!todo.thread) todo.thread = [];
      if (!todo.threadStatus) todo.threadStatus = 'open'; // open, closed, approved, rejected
    });
    return todos;
  } catch (e) {
    addAlertFromException('todo.json', e);
    return [];
  }
}


function saveTodos(todos) {
  fs.writeFileSync(TODO_FILE, JSON.stringify(todos, null, 2));
}

function buildDashboardJSON(todos, comments, selected, keyBindingsDesc) {
  const todoColumns = [
    ['Sel', ...todos.map((todo, i) => (i === selected ? '>' : ' '))],
    ['Status', ...todos.map(todo => todo.threadStatus || '')],
    ['Type', ...todos.map(todo => todo.status === 'error' ? 'ALERT' : 'FEEDBACK')],
    ['Text', ...todos.map(todo => todo.text.slice(0, 50))],
    ['Threads', ...todos.map(todo => todo.thread ? todo.thread.length : 0)]
  ];
  const commentList = Object.entries(comments).flatMap(([user, days]) => {
    return Object.entries(days).flatMap(([day, msgs]) =>
      msgs.map(msg => ({ user, day, msg }))
    );
  });
  const commentListWithSel = commentList.map((c, i) => {
    return { ...c, selected: selected === (todos.length + i) };
  });
  const keyHelp = keyBindingsDesc ? Object.entries(keyBindingsDesc)
    .map(([combo, desc]) => `${combo}: ${desc}`)
    .join(' | ') : '';
  // Add eventListeners (keyBindings) to JSON for protocol-driven UI
  const eventListeners = {};
  if (keyBindingsDesc) {
    for (const key in keyBindingsDesc) {
      eventListeners[key] = keyBindingsDesc[key];
    }
  }
  return {
    type: 'window',
    title: 'SYSTEM TODO & FEEDBACK DASHBOARD',
    width: 80,
    height: 24,
    eventListeners,
    children: [
      {
        type: 'columns',
        count: todoColumns.length,
        data: todoColumns
      },
      {
        type: 'loop',
        data: commentListWithSel,
        template: {
          type: 'row',
          children: [
            { type: 'text', content: 'User: {{user}}' },
            { type: 'text', content: 'Day: {{day}}' },
            { type: 'text', content: 'Msg: {{msg}}' },
            { type: 'text', content: '{{selected ? " <" : ""}}' }
          ]
        }
      },
      { type: 'text', content: keyHelp }
    ]
  };
}

function getStdout(io) {
  if (io && typeof io.stdout === 'function') return io.stdout;
  if (io && io.stdout && typeof io.stdout.write === 'function') return s => io.stdout.write(s);
  return s => process.stdout.write(s);
}

function printDashboard(todos, comments, selected, keyBindingsDesc, io) {
  const json = buildDashboardJSON(todos, comments, selected, keyBindingsDesc);
  const stdout = getStdout(io);
  renderDOM(json, stdout);
}



module.exports = async function htodo(args, env) {
    // Example usage of manageKeyListeners
    // Define handlers for each action
    const handlers = {
      moveDown: () => { selected = Math.min(selected + 1, todos.length + Object.entries(comments).flatMap(([user, days]) => Object.entries(days).flatMap(([day, msgs]) => msgs)).length - 1); printDashboard(todos, comments, selected, keyBindingsDesc, io); },
      moveUp: () => { selected = Math.max(selected - 1, 0); printDashboard(todos, comments, selected, keyBindingsDesc, io); },
      quit: () => { running = false; cleanup(); },
      deleteTodo: () => {
        const errorTodos = todos.filter(todo => todo.status === 'error');
        const otherTodos = todos.filter(todo => todo.status !== 'error');
        const allTodos = [...errorTodos, ...otherTodos];
        if (selected < allTodos.length) {
          const removed = allTodos[selected];
          todos = todos.filter((t, idx) => idx !== todos.indexOf(removed));
          saveTodos(todos);
          if (io && typeof io.stdout === 'function') io.stdout(`[Deleted] ${removed.text}\n`);
          else if (io && io.stdout && typeof io.stdout.write === 'function') io.stdout.write(`[Deleted] ${removed.text}\n`);
          if (todos.length === 0) { selected = 0; return; }
          printDashboard(todos, comments, selected, keyBindingsDesc, io);
        }
      },
      openThread: () => {
        const errorTodos = todos.filter(todo => todo.status === 'error');
        const otherTodos = todos.filter(todo => todo.status !== 'error');
        const allTodos = [...errorTodos, ...otherTodos];
        if (selected < allTodos.length) {
          if (io && typeof io.stdout === 'function') io.stdout('[DEBUG] Right arrow pressed, returning goto thread_viewer\n');
          else if (io && io.stdout && typeof io.stdout.write === 'function') io.stdout.write('[DEBUG] Right arrow pressed, returning goto thread_viewer\n');
          process.stdin.removeAllListeners('keypress');
          if (process.stdin.isTTY) { try { process.stdin.setRawMode(false); } catch {} }
          running = false;
          if (io && typeof io.resolve === 'function') io.resolve({ goto: 'thread_viewer', threadId: selected });
          safeCleanup();
        }
      },
      f12: () => { running = false; cleanup(); },
      ctrlC: () => { running = false; cleanup(); }
    };
    // Declarative key map
    const keyMap = {
      keypress: {
        'down,j': 'moveDown',
        'up,k': 'moveUp',
        'd': 'deleteTodo',
        'right': 'openThread',
        'q': 'quit',
        'f12': 'f12',
        'c': 'ctrlC' // Will check ctrl below
      }
    };
    // Attach listeners
    manageKeyListeners(keyMap, handlers);
    // Special case for ctrl+c
    process.stdin.on('keypress', (str, key) => { if (key && key.ctrl && key.name === 'c') handlers.ctrlC(str, key); });
  const io = env || {};
  function safeCleanup() {
    try { if (typeof cleanup === 'function') cleanup(); } catch {}
    if (io && typeof io.restorePrompt === 'function') io.restorePrompt();
  }
  try {
    if (io && typeof io.stdout === 'function') io.stdout('\x1b[?1049h');
    else if (io && io.stdout && typeof io.stdout.write === 'function') io.stdout.write('\x1b[?1049h');
    if (io && typeof io.stdout === 'function') io.stdout('[DEBUG] htodo.js: ENTERED MAIN FUNCTION\n');
    const username = process.env.JS_SHELL_USER || os.userInfo().username || 'unknown';
    if (username !== 'admin' && username !== 'home') {
      if (io && typeof io.stdout === 'function') io.stdout('Only the admin/home user can use the dashboard.\n');
      else if (io && io.stdout && typeof io.stdout.write === 'function') io.stdout.write('Only the admin/home user can use the dashboard.\n');
      safeCleanup();
      return 1;
    }
    if (!process.stdin.isTTY) {
      if (io && typeof io.stdout === 'function') io.stdout('\x1b[31m[WARNING]\x1b[0m Command keys will not work: not running in a TTY. Try running in a real terminal.\n');
      else if (io && io.stdout && typeof io.stdout.write === 'function') io.stdout.write('\x1b[31m[WARNING]\x1b[0m Command keys will not work: not running in a TTY. Try running in a real terminal.\n');
    }
    let todos = loadTodos();
    let comments = loadComments();
    let selected = 0;
    let running = true;
    // Ensure keypress events and raw mode
    if (process.stdin.isTTY) {
      try { process.stdin.setRawMode(true); } catch {}
      readline.emitKeypressEvents(process.stdin);
    }
    // Centralized key binding map (can be replaced/extended by child apps)
    let keyBindings = {
      'f12': () => { running = false; cleanup(); },
      'down': () => { selected = Math.min(selected + 1, todos.length + Object.entries(comments).flatMap(([user, days]) => Object.entries(days).flatMap(([day, msgs]) => msgs)).length - 1); },
      'j': () => { selected = Math.min(selected + 1, todos.length + Object.entries(comments).flatMap(([user, days]) => Object.entries(days).flatMap(([day, msgs]) => msgs)).length - 1); },
      'up': () => { selected = Math.max(selected - 1, 0); },
      'k': () => { selected = Math.max(selected - 1, 0); },
      'd': () => {
        const errorTodos = todos.filter(todo => todo.status === 'error');
        const otherTodos = todos.filter(todo => todo.status !== 'error');
        const allTodos = [...errorTodos, ...otherTodos];
        if (selected < allTodos.length) {
          const removed = allTodos[selected];
          todos = todos.filter((t, idx) => idx !== todos.indexOf(removed));
          saveTodos(todos);
          if (io && typeof io.stdout === 'function') io.stdout(`[Deleted] ${removed.text}\n`);
          else if (io && io.stdout && typeof io.stdout.write === 'function') io.stdout.write(`[Deleted] ${removed.text}\n`);
          if (todos.length === 0) { selected = 0; return; }
        }
      },
      'right': () => {
        const errorTodos = todos.filter(todo => todo.status === 'error');
        const otherTodos = todos.filter(todo => todo.status !== 'error');
        const allTodos = [...errorTodos, ...otherTodos];
        if (selected < allTodos.length) {
          if (io && typeof io.stdout === 'function') io.stdout('[DEBUG] Right arrow pressed, returning goto thread_viewer\n');
          else if (io && io.stdout && typeof io.stdout.write === 'function') io.stdout.write('[DEBUG] Right arrow pressed, returning goto thread_viewer\n');
          process.stdin.removeAllListeners('keypress');
          if (process.stdin.isTTY) { try { process.stdin.setRawMode(false); } catch {} }
          running = false;
          if (io && typeof io.resolve === 'function') io.resolve({ goto: 'thread_viewer', threadId: selected });
          safeCleanup();
        }
      },
      'q': () => { running = false; cleanup(); },
      // Add more custom/contextual bindings here
    };
    // Key binding descriptions for UI
    let keyBindingsDesc = {
      'F12': 'Toggle dashboard',
      'Up/Down': 'Move selection',
      'j/k': 'Move selection',
      'd': 'Delete todo',
      'q': 'Quit',
      'right': 'Open thread viewer'
    };
    // Allow child apps to override/extend keyBindings and keyBindingsDesc
    if (args && args.keyBindings) keyBindings = { ...keyBindings, ...args.keyBindings };
    if (args && args.keyBindingsDesc) keyBindingsDesc = { ...keyBindingsDesc, ...args.keyBindingsDesc };
    // Listener management
    const previousListeners = process.stdin.listeners('keypress');
    process.stdin.removeAllListeners('keypress');
    let keypressAttached = false;
    function dashboardKeyListener(str, key) {
      if (!running) return;
      if (key && keyBindings[key.name]) {
        keyBindings[key.name]();
      } else if (key && key.ctrl && key.name === 'c') {
        running = false; cleanup();
      }
      printDashboard(todos, comments, selected, keyBindingsDesc, io);
    }
    if (!keypressAttached) {
      process.stdin.on('keypress', dashboardKeyListener);
      keypressAttached = true;
    }
    printDashboard(todos, comments, selected, keyBindingsDesc, io);
    await (async function mainLoop() {
      while (running) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    })();
    process.stdin.removeAllListeners('keypress');
    previousListeners.forEach(l => process.stdin.on('keypress', l));
    if (process.stdin.isTTY) { try { process.stdin.setRawMode(false); } catch {} }
    if (io && typeof io.stdout === 'function') io.stdout('\x1b[?1049l\n');
    else if (io && io.stdout && typeof io.stdout.write === 'function') io.stdout.write('\x1b[?1049l\n');
    if (io && typeof io.restorePrompt === 'function') io.restorePrompt();
    return 0;
  } catch (e) {
    safeCleanup();
    if (io && typeof io.stdout === 'function') io.stdout(`[DASHBOARD ERROR]: ${e && e.stack ? e.stack : e}\n`);
    else if (io && io.stdout && typeof io.stdout.write === 'function') io.stdout.write(`[DASHBOARD ERROR]: ${e && e.stack ? e.stack : e}\n`);
  }
};
