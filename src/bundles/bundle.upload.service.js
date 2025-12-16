// src/bundles/bundle.upload.service.js
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const { s3, region } = require("../config/s3");

const BUCKET = process.env.S3_BUCKET;
const PREFIX = process.env.S3_PREFIX || "uploads";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function extFromContentType(ct) {
  if (ct === "image/jpeg") return "jpg";
  if (ct === "image/png") return "png";
  if (ct === "image/webp") return "webp";
  return "bin";
}

function keyFromUrl(url) {
  const u = new URL(url);
  return u.pathname.startsWith("/") ? u.pathname.slice(1) : u.pathname;
}

// ✅ presign for ADD bundle (no id yet)
async function presignNewBundleImageUpload(userId, contentType) {
  if (!BUCKET) throw new Error("S3_BUCKET is not set");
  if (!ALLOWED.has(contentType)) {
    const err = new Error("Only jpeg/png/webp images allowed");
    err.statusCode = 400;
    throw err;
  }

  const key = `${PREFIX}/bundles/new/${userId}/${uuidv4()}.${extFromContentType(contentType)}`;

  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 });
  const url = `https://${BUCKET}.s3.${region}.amazonaws.com/${key}`;

  return { key, uploadUrl, url };
}

// ✅ presign for EDIT bundle (has id)
async function presignBundleImageUpload(userId, bundleId, contentType) {
  if (!BUCKET) throw new Error("S3_BUCKET is not set");
  if (!ALLOWED.has(contentType)) {
    const err = new Error("Only jpeg/png/webp images allowed");
    err.statusCode = 400;
    throw err;
  }

  // verify bundle belongs to user
  const { rows } = await pool.query(
    "SELECT id FROM bundles WHERE id = $1 AND user_id = $2",
    [bundleId, userId]
  );

  if (rows.length === 0) {
    const err = new Error("Bundle not found");
    err.statusCode = 404;
    throw err;
  }

  const key = `${PREFIX}/bundles/${bundleId}/${uuidv4()}.${extFromContentType(contentType)}`;

  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 });
  const url = `https://${BUCKET}.s3.${region}.amazonaws.com/${key}`;

  return { key, uploadUrl, url };
}

// ✅ view signed url (private bucket)
async function getPresignedViewUrlForBundle(userId, bundleId) {
  const { rows } = await pool.query(
    "SELECT image_url FROM bundles WHERE id = $1 AND user_id = $2",
    [bundleId, userId]
  );

  if (rows.length === 0) {
    const err = new Error("Bundle not found");
    err.statusCode = 404;
    throw err;
  }
  if (!rows[0].image_url) {
    const err = new Error("Bundle has no image");
    err.statusCode = 400;
    throw err;
  }

  const key = keyFromUrl(rows[0].image_url);
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  const viewUrl = await getSignedUrl(s3, cmd, { expiresIn: 7200 });

  return { viewUrl };
}

module.exports = {
  presignNewBundleImageUpload,
  presignBundleImageUpload,
  getPresignedViewUrlForBundle,
};
