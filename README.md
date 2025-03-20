# AWS S3 Folder Copy Service

A Node.js application that copies folders from one AWS S3 bucket to another, made with ❤️ by Ahmed.

## Features

- Copy folders and files from a source S3 bucket to a destination S3 bucket
- Validate AWS credentials and permissions before executing copy operations
- Maintain the same folder structure during copying
- Background processing for large copy operations
- Success and error logging
- Clean REST API interface

## Installation

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Copy the `.env.example` file to `.env` and update with your AWS credentials
   ```
   cp .env.example .env
   ```
4. Edit the `.env` file with your AWS credentials and bucket information

## Environment Variables

- `PORT`: Server port (default: 8080)
- `NODE_ENV`: Environment (development/production)
- `SOURCE_AWS_ACCESS_KEY_ID`: Source AWS access key
- `SOURCE_AWS_SECRET_ACCESS_KEY`: Source AWS secret key
- `SOURCE_AWS_REGION`: Source AWS region
- `SOURCE_BUCKET_NAME`: Source bucket name
- `DESTINATION_AWS_ACCESS_KEY_ID`: Destination AWS access key
- `DESTINATION_AWS_SECRET_ACCESS_KEY`: Destination AWS secret key
- `DESTINATION_AWS_SESSION_TOKEN`: Destination AWS session token (if using temporary credentials)
- `DESTINATION_AWS_REGION`: Destination AWS region
- `DESTINATION_BUCKET_NAME`: Destination bucket name
- `CUSTOM_FILE_EXTENSION`: Custom file extension to add to data files (e.g., 'parquet')

## Starting the Server

```
npm start
```

For development with auto-reload:

```
npm run dev
```

## API Endpoints

### Root Endpoint

```
GET /
```

Response:

```json
{
  "message": "Made with ❤️ by Ahmed",
  "status": "OK",
  "version": "1.0.0"
}
```

### Copy S3 Folders Endpoint

```
POST /fetch-and-ingest
```

Request Body:

```json
{
  "sourcePath": "folder/subfolder/tablefolder",
  "destinationPath": "folder/subfolder/tablefolder",
  "options": {
    "applyCustomExtension": true
  }
}
```

- `sourcePath`: The path in the source S3 bucket to copy from
- `destinationPath`: The path in the destination S3 bucket to copy to
- `options`: Optional parameters
  - `applyCustomExtension`: Whether to apply the custom file extension from the .env file

Response:

```json
{
  "success": true,
  "message": "Request accepted. S3 copy operation started in the background.",
  "details": {
    "sourcePath": "folder/subfolder/tablefolder",
    "destinationPath": "folder/subfolder/tablefolder",
    "options": {
      "applyCustomExtension": true
    },
    "timestamp": "2023-06-01T12:34:56.789Z"
  }
}
```

## Logs

The application maintains two log files:

- `src/logs/success.log`: Contains all successful operations
- `src/logs/error.log`: Contains errors and failures

## Required AWS Permissions

### Source S3 Bucket

- `s3:GetObject`
- `s3:GetObjectVersion`
- `s3:ListBucket`
- `s3:GetBucketNotification`
- `s3:GetBucketLocation`

### Destination S3 Bucket

- `s3:PutObject`
- `s3:DeleteObject` (for validation only)
- `s3:GetBucketLocation`

## License

ISC
