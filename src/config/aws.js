const AWS = require("aws-sdk");
require("dotenv").config();

// Source S3 client configuration
const sourceS3Client = new AWS.S3({
  accessKeyId: process.env.SOURCE_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.SOURCE_AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.DESTINATION_AWS_SESSION_TOKEN,
  region: process.env.SOURCE_AWS_REGION,
});

// Destination S3 client configuration
const destinationS3Client = new AWS.S3({
  accessKeyId: process.env.DESTINATION_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.DESTINATION_AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.DESTINATION_AWS_SESSION_TOKEN,
  region: process.env.DESTINATION_AWS_REGION,
});

// Required permissions for source client
const requiredSourcePermissions = [
  "s3:GetObject",
  "s3:GetObjectVersion",
  "s3:ListBucket",
  "s3:GetBucketNotification",
  "s3:GetBucketLocation",
];

module.exports = {
  sourceS3Client,
  destinationS3Client,
  sourceBucketName: process.env.SOURCE_BUCKET_NAME,
  destinationBucketName: process.env.DESTINATION_BUCKET_NAME,
  requiredSourcePermissions,
  fileExtension: process.env.CUSTOM_FILE_EXTENSION,
};
