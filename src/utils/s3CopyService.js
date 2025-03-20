const {
  sourceS3Client,
  destinationS3Client,
  sourceBucketName,
  destinationBucketName,
  fileExtension,
} = require("../config/aws");
const { logSuccess, logError } = require("./logger");

/**
 * List all objects in a S3 folder
 * @param {string} prefix - The folder path prefix
 * @returns {Promise<Array>} - List of objects
 */
const listSourceObjects = async (prefix) => {
  let allObjects = [];
  let continuationToken = null;

  do {
    const params = {
      Bucket: sourceBucketName,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    };

    const response = await sourceS3Client.listObjectsV2(params).promise();

    if (response.Contents && response.Contents.length > 0) {
      allObjects = [...allObjects, ...response.Contents];
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return allObjects;
};

/**
 * Copy a single file from source to destination
 * @param {string} sourceKey - Source object key
 * @param {string} destinationKey - Destination object key
 * @returns {Promise<void>}
 */
const copyFile = async (sourceKey, destinationKey) => {
  try {
    // Get object from source
    const sourceObject = await sourceS3Client
      .getObject({
        Bucket: sourceBucketName,
        Key: sourceKey,
      })
      .promise();

    // Upload to destination
    await destinationS3Client
      .putObject({
        Bucket: destinationBucketName,
        Key: destinationKey,
        Body: sourceObject.Body,
        ContentType: sourceObject.ContentType,
      })
      .promise();

    logSuccess(`Copied: ${sourceKey} -> ${destinationKey}`);
  } catch (error) {
    logError(`Failed to copy file ${sourceKey}: ${error.message}`, error);
    throw error;
  }
};

/**
 * Copy all files from source path to destination path
 * @param {string} sourcePath - Source path in S3 bucket
 * @param {string} destinationPath - Destination path in S3 bucket
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Result with counts
 */
const copyFolderContents = async (
  sourcePath,
  destinationPath,
  options = {}
) => {
  try {
    // Ensure paths end with a trailing slash if they're not empty
    const sourcePrefix = sourcePath
      ? sourcePath.endsWith("/")
        ? sourcePath
        : `${sourcePath}/`
      : "";
    const destPrefix = destinationPath
      ? destinationPath.endsWith("/")
        ? destinationPath
        : `${destinationPath}/`
      : "";

    // Set default options
    const defaultOptions = {
      applyCustomExtension: false,
      addExtensionToFilesWithoutExt: true,
    };

    const finalOptions = { ...defaultOptions, ...options };

    logSuccess(`Starting to copy from ${sourcePrefix} to ${destPrefix}`);

    // List all objects in the source path
    const objects = await listSourceObjects(sourcePrefix);
    console.log(JSON.stringify(objects, null, 2));

    if (objects.length === 0) {
      logError(`No objects found in source path: ${sourcePrefix}`);
      return {
        success: false,
        message: "No objects found in source path",
        count: 0,
      };
    }

    logSuccess(`Found ${objects.length} objects to copy`);

    // Process each object
    let successCount = 0;
    let failureCount = 0;

    const promises = objects.map(async (object) => {
      try {
        // Calculate the relative path from the source prefix
        const relativePath = object.Key.substring(sourcePrefix.length);
        // Build the destination key using the destination prefix and the relative path
        let destinationKey = `${destPrefix}${relativePath}`;

        // Check if we need to handle file extensions
        if (fileExtension && !destinationKey.endsWith("/")) {
          const filePathParts = destinationKey.split(".");
          const hasExtension = filePathParts.length > 1;

          // Check if this is a file that needs extension handling
          const isInDateFolder = /\d{4}\/\d{2}\/\d{2}\/[^\/]+$/.test(
            destinationKey
          );

          // Case 1: Replace existing extension if applyCustomExtension is true
          if (finalOptions.applyCustomExtension && hasExtension) {
            filePathParts[filePathParts.length - 1] = fileExtension.startsWith(
              "."
            )
              ? fileExtension.substring(1)
              : fileExtension;
            destinationKey = filePathParts.join(".");
          }
          // Case 2: Add extension to files without one (in date folders or if option is set)
          else if (
            (finalOptions.addExtensionToFilesWithoutExt || isInDateFolder) &&
            !hasExtension
          ) {
            const ext = fileExtension.startsWith(".")
              ? fileExtension
              : `.${fileExtension}`;
            destinationKey = `${destinationKey}${ext}`;
          }
        }

        await copyFile(object.Key, destinationKey);
        successCount++;
      } catch (error) {
        failureCount++;
        // Error is already logged in copyFile
      }
    });

    // Wait for all copy operations to complete
    await Promise.all(promises);

    return {
      success: true,
      message: "Copy operation completed",
      successCount,
      failureCount,
      totalCount: objects.length,
    };
  } catch (error) {
    logError(`Error in copyFolderContents: ${error.message}`, error);
    return {
      success: false,
      message: error.message,
      errorDetails: error.stack,
    };
  }
};

module.exports = {
  copyFolderContents,
};
