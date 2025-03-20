const {
  validateSourceS3Client,
  validateDestinationS3Client,
} = require("../utils/s3Validator");
const { copyFolderContents } = require("../utils/s3CopyService");
const { logSuccess, logError } = require("../utils/logger");

/**
 * Fetch data from source S3 and ingest to destination S3
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const fetchAndIngest = async (req, res) => {
  const { sourcePath, destinationPath, options = {} } = req.body;

  // Validate required parameters
  if (!sourcePath || !destinationPath) {
    return res.status(400).json({
      success: false,
      message: "Both sourcePath and destinationPath are required",
    });
  }

  try {
    // Send immediate response
    res.status(202).json({
      success: true,
      message: "Request accepted. S3 copy operation started in the background.",
      details: {
        sourcePath,
        destinationPath,
        options,
        timestamp: new Date().toISOString(),
      },
    });

    // Continue processing in the background
    processCopyOperation(sourcePath, destinationPath, options);
  } catch (error) {
    logError(`Error in fetchAndIngest controller: ${error.message}`, error);
    // We don't send an error response here since we've already sent a 202 response
  }
};

/**
 * Process the copy operation in the background
 * @param {string} sourcePath - Source path in S3
 * @param {string} destinationPath - Destination path in S3
 * @param {Object} options - Optional parameters
 */
const processCopyOperation = async (sourcePath, destinationPath, options) => {
  try {
    logSuccess(
      `Starting background processing for copying from ${sourcePath} to ${destinationPath}`
    );

    // Validate S3 clients before proceeding
    const isSourceValid = await validateSourceS3Client();
    if (!isSourceValid) {
      logError("Source S3 client validation failed. Aborting copy operation.");
      return;
    }

    const isDestinationValid = await validateDestinationS3Client();
    if (!isDestinationValid) {
      logError(
        "Destination S3 client validation failed. Aborting copy operation."
      );
      return;
    }

    // Proceed with the copy operation
    const result = await copyFolderContents(
      sourcePath,
      destinationPath,
      options
    );

    if (result.success || isDestinationValid) {
      logSuccess(
        `Copy operation completed successfully. Copied ${result.successCount} of ${result.totalCount} objects.`
      );
      if (result.failureCount > 0) {
        logError(
          `Failed to copy ${result.failureCount} objects. Check error log for details.`
        );
      }
    } else {
      logError(`Copy operation failed: ${result.message}`);
    }
  } catch (error) {
    logError(`Error in background processing: ${error.message}`, error);
  }
};

module.exports = {
  fetchAndIngest,
};
