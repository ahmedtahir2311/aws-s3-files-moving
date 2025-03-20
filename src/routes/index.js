const express = require("express");
const s3Routes = require("./s3Routes");

const router = express.Router();

// Root route
router.get("/", (req, res) => {
  res.json({
    message: "Made with ❤️ by Ahmed",
    status: "OK",
    version: "1.0.0",
  });
});

// S3 routes
router.use("/fetch-all-and-ingest-data", s3Routes);

module.exports = router;
