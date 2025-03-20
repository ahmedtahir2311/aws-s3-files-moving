const {
  sourceS3Client,
  destinationS3Client,
  sourceBucketName,
  destinationBucketName,
  requiredSourcePermissions,
} = require("../config/aws");
const { logError, logSuccess } = require("./logger");

/**
 * Validate the source S3 client has the required permissions
 * @returns {Promise<boolean>} True if all permissions are valid
 */
const validateSourceS3Client = async () => {
  try {
    // Test GetBucketLocation to validate credentials
    await destinationS3Client
      .getBucketLocation({ Bucket: sourceBucketName })
      .promise();

    // Test ListObjects to validate bucket access
    await destinationS3Client
      .listObjectsV2({
        Bucket: sourceBucketName,
        MaxKeys: 1,
      })
      .promise();

    logSuccess(
      `Source S3 client validated successfully for bucket: ${sourceBucketName}`
    );
    return true;
  } catch (error) {
    logError(`Source S3 client validation failed: ${error.message}`, error);
    return false;
  }
};

/**
 * Validate the destination S3 client
 * @returns {Promise<boolean>} True if the client is valid
 */
const validateDestinationS3Client = async () => {
  try {
    // Test GetBucketLocation to validate credentials
    await destinationS3Client
      .getBucketLocation({ Bucket: destinationBucketName })
      .promise();

    // Test PutObject permission by creating a small test file and then deleting it
    const testKey = `test-permission-${Date.now()}.txt`;
    await destinationS3Client
      .putObject({
        Bucket: destinationBucketName,
        Key: testKey,
        Body: "This is a test file to validate write permissions",
      })
      .promise();

    // Clean up the test file
    await destinationS3Client
      .deleteObject({
        Bucket: destinationBucketName,
        Key: testKey,
      })
      .promise();

    logSuccess(
      `Destination S3 client validated successfully for bucket: ${destinationBucketName}`
    );
    return true;
  } catch (error) {
    logError(
      `Destination S3 client validation failed: ${error.message}`,
      error
    );
    return false;
  }
};

module.exports = {
  validateSourceS3Client,
  validateDestinationS3Client,
};
