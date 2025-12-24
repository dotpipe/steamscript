// ajax_pipe.js - Unified AJAX/pipe abstraction for network and IPC
const http = require('http');
const https = require('https');
const { spawn } = require('child_process');

async function ajaxPipe(opts) {
  if (opts.url && opts.url.startsWith('http')) {
    // External HTTP(S) request
    return new Promise((resolve, reject) => {
      const lib = opts.url.startsWith('https') ? https : http;
      const req = lib.request(opts.url, { method: opts.method || 'GET' }, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      req.on('error', reject);
      if (opts.body) req.write(opts.body);
      req.end();
    });
  } else if (opts.pipe) {
    // Local pipe/IPC (e.g., spawn a process)
    return new Promise((resolve, reject) => {
      const proc = spawn(opts.pipe, opts.args || []);
      let data = '';
      proc.stdout.on('data', chunk => data += chunk);
      proc.on('close', code => resolve({ status: code, data }));
      proc.on('error', reject);
      if (opts.input) proc.stdin.write(opts.input);
      proc.stdin.end();
    });
  } else {
    throw new Error('Invalid ajaxPipe options');
  }
}

module.exports = ajaxPipe;
