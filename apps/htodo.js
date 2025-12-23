// htodo.js - Interactive TODO and feedback dashboard for js_shell
// Shows system TODOs, user comments, and lets admin/home user navigate with keys (F12 toggles dashboard)

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');

const COMMENTS_FILE = path.join(__dirname, '..', 'comments.json');
const TODO_FILE = path.join(__dirname, '..', 'todo.json');

function loadComments() {
  if (!fs.existsSync(COMMENTS_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(COMMENTS_FILE, 'utf-8')); } catch { return {}; }
}

function loadTodos() {
  if (!fs.existsSync(TODO_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(TODO_FILE, 'utf-8')); } catch { return []; }
}

function saveTodos(todos) {
  fs.writeFileSync(TODO_FILE, JSON.stringify(todos, null, 2));
}

function printDashboard(todos, comments, selected, io) {
  io.stdout('\x1b[2J\x1b[H'); // Clear screen
  const termHeight = process.stdout.rows || 24;
  io.stdout('==== SYSTEM TODO & FEEDBACK DASHBOARD ====' + '\n');
  let lines = [];
  todos.forEach((todo, i) => {
    lines.push((i === selected ? '> ' : '  ') + `[${todo.status}] ${todo.text}`);
  });
  let cidx = 0;
  for (const user in comments) {
    for (const day in comments[user]) {
      for (const msg of comments[user][day]) {
        lines.push(`[${user} @ ${day}]: ${msg}`);
        cidx++;
      }
    }
  }
  // Fill up to terminal height
  for (let i = 0; i < Math.min(lines.length, termHeight - 4); i++) {
    io.stdout(lines[i] + '\n');
  }
  io.stdout('\nF12: Toggle dashboard | Up/Down: Move | q: Quit\n');
}

module.exports = async function htodo(args, io) {
  const username = process.env.JS_SHELL_USER || os.userInfo().username || 'unknown';
  if (username !== 'admin' && username !== 'home') {
    io.stdout('Only the admin/home user can use the dashboard.\n');
    return 1;
  }
  let todos = loadTodos();
  let comments = loadComments();
  let selected = 0;
  let inDashboard = true;
  printDashboard(todos, comments, selected, io);
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);
  return await new Promise(resolve => {
    function onKey(str, key) {
      if (!inDashboard) {
        process.stdin.removeListener('keypress', onKey);
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        io.stdout('\n');
        resolve(0);
        return;
      }
      if (key && key.name === 'f12') {
        inDashboard = false;
        printDashboard(todos, comments, selected, io);
        process.stdin.removeListener('keypress', onKey);
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        io.stdout('\n');
        resolve(0);
        return;
      }
      if (key && (key.name === 'down' || key.name === 'j')) {
        selected = Math.min(selected + 1, todos.length + Object.values(comments).flat(2).length - 1);
        printDashboard(todos, comments, selected, io);
      } else if (key && (key.name === 'up' || key.name === 'k')) {
        selected = Math.max(selected - 1, 0);
        printDashboard(todos, comments, selected, io);
      } else if (key && (key.name === 'q' || (key.ctrl && key.name === 'c'))) {
        inDashboard = false;
        printDashboard(todos, comments, selected, io);
        process.stdin.removeListener('keypress', onKey);
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        io.stdout('\n');
        resolve(0);
      }
    }
    process.stdin.on('keypress', onKey);
  });
};
