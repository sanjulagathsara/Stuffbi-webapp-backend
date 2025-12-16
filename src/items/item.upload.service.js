const { PutObjectCommand } = require("@aws-sdk/client-s3");
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

async function presignItemImageUpload(userId, itemId, contentType) {
  if (!BUCKET) throw new Error("S3_BUCKET is not set");
  if (!ALLOWED.has(contentType)) {
    const err = new Error("Only jpeg/png/webp images allowed");
    err.statusCode = 400;
    throw err;
  }

  // Ensure item belongs to user
  const { rows } = await pool.query(
    "SELECT id FROM items WHERE id = $1 AND user_id = $2",
    [itemId, userId]
  );
  if (rows.length === 0) {
    const err = new Error("Item not found");
    err.statusCode = 404;
    throw err;
  }

  const key = `${PREFIX}/items/${itemId}/${uuidv4()}.${extFromContentType(contentType)}`;

  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 });

  // This is the object URL format (works if objects are public; if private, you’ll need presigned GET to view)
  const url = `https://${BUCKET}.s3.${region}.amazonaws.com/${key}`;

  return { key, uploadUrl, url };
}

module.exports = { presignItemImageUpload };
