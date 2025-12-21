#!/usr/bin/env node
// cal
const argv = process.argv.slice(2);
const now = new Date();
const month = argv[0] ? parseInt(argv[0]) - 1 : now.getMonth();
const year = argv[1] ? parseInt(argv[1]) : now.getFullYear();
const first = new Date(year, month, 1);
const last = new Date(year, month + 1, 0);
console.log('Su Mo Tu We Th Fr Sa');
let out = Array(first.getDay()).fill('  ');
for (let d = 1; d <= last.getDate(); ++d) out.push(String(d).padStart(2, ' '));
while (out.length) console.log(out.splice(0, 7).join(' '));
