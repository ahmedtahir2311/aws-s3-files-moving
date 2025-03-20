const fs = require("fs");
const path = require("path");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const successLogPath = path.join(logsDir, "success.log");
const errorLogPath = path.join(logsDir, "error.log");

/**
 * Log success message to success.log file
 * @param {string} message - Success message to log
 */
const logSuccess = (message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] SUCCESS: ${message}\n`;

  fs.appendFileSync(successLogPath, logEntry);
  console.log(`\x1b[32m${logEntry}\x1b[0m`); // Green colored log
};

/**
 * Log error message to error.log file
 * @param {string} message - Error message to log
 * @param {Error} [error] - Optional error object
 */
const logError = (message, error = null) => {
  const timestamp = new Date().toISOString();
  let logEntry = `[${timestamp}] ERROR: ${message}\n`;

  if (error) {
    logEntry += `Stack: ${error.stack}\n`;
  }

  fs.appendFileSync(errorLogPath, logEntry);
  console.error(`\x1b[31m${logEntry}\x1b[0m`); // Red colored log
};

module.exports = {
  logSuccess,
  logError,
};
