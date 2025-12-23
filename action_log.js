// action_log.js
// Logs shell actions in real time to the console and to audit.log
const fs = require('fs');
const path = require('path');
const auditLogPath = path.join(__dirname, '../audit.log');

// Only used for error logging in system programs
function logSystemError(errorMsg) {
  // Add error as a TODO in todo.json for admin review
  const todoPath = path.join(__dirname, 'todo.json');
  let todos = [];
  try {
    if (fs.existsSync(todoPath)) {
      todos = JSON.parse(fs.readFileSync(todoPath, 'utf-8'));
    }
  } catch {}
  todos.push({ status: 'error', text: errorMsg });
  try {
    fs.writeFileSync(todoPath, JSON.stringify(todos, null, 2));
  } catch {}
}

module.exports = { logSystemError };
