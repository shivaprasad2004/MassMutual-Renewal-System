// Simple Logger Utility (Can be enhanced with Winston/Morgan)
const log = (level, message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}]: ${message}`);
};

module.exports = {
  info: (msg) => log('info', msg),
  error: (msg) => log('error', msg),
  warn: (msg) => log('warn', msg),
};
