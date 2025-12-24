// htodo_alert.js - Utility to add alerts to the htodo (todo.json) list
const fs = require('fs');
const path = require('path');
const TODO_FILE = path.join(__dirname, '..', 'todo.json');

function addAlertFromException(app, e) {
  try {
    let todos = [];
    if (fs.existsSync(TODO_FILE)) {
      todos = JSON.parse(fs.readFileSync(TODO_FILE, 'utf-8'));
    }
    todos.push({ status: 'error', text: `[${app} exception]: ${e && e.stack ? e.stack : e}` });
    fs.writeFileSync(TODO_FILE, JSON.stringify(todos, null, 2));
  } catch {}
}

module.exports = { addAlertFromException };
