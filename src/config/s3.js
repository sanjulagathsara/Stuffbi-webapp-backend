// src/config/s3.js
// S3 client configuration

const { S3Client } = require("@aws-sdk/client-s3");

const region = process.env.AWS_REGION || "us-east-1";

const s3 = new S3Client({
  region,
  // On EC2 with IAM Role: no credentials here
});

module.exports = { s3, region };
