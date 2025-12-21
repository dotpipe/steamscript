// sleep.js - universal sleep command
module.exports = async function(args, io, input) {
  const ms = parseInt(args[0] || '1', 10) * 1000;
  await new Promise(r => setTimeout(r, ms));
};