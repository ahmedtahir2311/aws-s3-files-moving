/**
 * Middleware to validate the request body for the fetch-and-ingest endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateFetchAndIngestRequest = (req, res, next) => {
  const { sourcePath, destinationPath } = req.body;

  // Check for required fields
  if (!sourcePath) {
    return res.status(400).json({
      success: false,
      message: "sourcePath is required",
    });
  }

  if (!destinationPath) {
    return res.status(400).json({
      success: false,
      message: "destinationPath is required",
    });
  }

  // Validate that paths are strings
  if (typeof sourcePath !== "string" || typeof destinationPath !== "string") {
    return res.status(400).json({
      success: false,
      message: "sourcePath and destinationPath must be strings",
    });
  }

  // Validate that options is an object if provided
  if (req.body.options && typeof req.body.options !== "object") {
    return res.status(400).json({
      success: false,
      message: "options must be an object if provided",
    });
  }

  // Pass to the next middleware
  next();
};

module.exports = {
  validateFetchAndIngestRequest,
};
