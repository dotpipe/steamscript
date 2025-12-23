// comment.js - User feedback/comment program for js_shell
// Allows users to send up to 3 comments per day to the admin. Admin sees comments at login or via a command.

const fs = require('fs');
const path = require('path');
const os = require('os');

const COMMENTS_FILE = path.join(__dirname, '..', 'comments.json');
const MAX_COMMENTS_PER_DAY = 3;

function getToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function loadComments() {
  if (!fs.existsSync(COMMENTS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(COMMENTS_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveComments(comments) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));
}

module.exports = async function comment(args, io) {
  const username = process.env.JS_SHELL_USER || os.userInfo().username || 'unknown';
  const today = getToday();
  const comments = loadComments();
  if (!comments[username]) comments[username] = {};
  if (!comments[username][today]) comments[username][today] = [];
  if (comments[username][today].length >= MAX_COMMENTS_PER_DAY) {
    io.stdout('You have reached your comment limit for today.\n');
    return 1;
  }
  const msg = await io.readLine('Enter your comment for the admin: ');
  if (!msg.trim()) {
    io.stdout('No comment entered.\n');
    return 1;
  }
  comments[username][today].push(msg.trim());
  saveComments(comments);
  io.stdout('Comment sent to admin.\n');
  return 0;
};
