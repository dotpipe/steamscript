// action_log.js
// Logs shell actions in real time to the console and to audit.log
const fs = require('fs');
const path = require('path');
const auditLogPath = path.join(__dirname, '../audit.log');

function logAction(action, user) {
  const entry = `[${new Date().toISOString()}] ${user || 'system'}: ${action}`;
  console.log(entry);
  try {
    fs.appendFileSync(auditLogPath, entry + '\n');
  } catch (e) {
    console.error('Failed to write to audit.log:', e.message);
  }
}

module.exports = { logAction };
