const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const routes = require("./routes");
const { logError } = require("./utils/logger");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan("dev")); // HTTP request logger

// Routes
app.use("/api", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  logError(`Express error: ${err.message}`, err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logError("Unhandled Promise Rejection", err);
  // Don't crash the server
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logError("Uncaught Exception", err);
  // Give the server a grace period to finish existing requests
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

module.exports = app;
