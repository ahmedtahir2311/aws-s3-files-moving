const express = require("express");
const s3Controller = require("../controllers/s3Controller");
const {
  validateFetchAndIngestRequest,
} = require("../middlewares/validateRequest");

const router = express.Router();

// put /fetch-and-ingest - Fetch from source S3 and ingest to destination S3
router.put("/", validateFetchAndIngestRequest, s3Controller.fetchAndIngest);

module.exports = router;
