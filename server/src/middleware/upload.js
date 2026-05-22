import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { s3Client, s3Bucket, s3Enabled } from '../config/s3.js';
import { isServerless, useS3Storage, assertUploadConfig } from '../config/runtime.js';

assertUploadConfig();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localDir = path.join(process.cwd(), 'uploads');

function ensureLocalDir() {
  if (isServerless) return;
  try {
    fs.mkdirSync(localDir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') console.warn('Could not create uploads dir:', err.message);
  }
}

const allowed = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'text/plain',
]);

function fileFilter(_req, file, cb) {
  if (allowed.has(file.mimetype)) cb(null, true);
  else cb(new Error('Only PDF and image files are allowed'));
}

function localStorage() {
  ensureLocalDir();
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureLocalDir();
      cb(null, localDir);
    },
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
}

function resolveStorage() {
  if (s3Enabled && s3Client) {
    return multerS3({
      s3: s3Client,
      bucket: s3Bucket,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `bookings/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
      },
    });
  }

  if (isServerless) {
    throw new Error('S3 storage is required on Vercel. Configure AWS environment variables.');
  }

  return localStorage();
}

export const upload = multer({
  storage: resolveStorage(),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export function getFileUrl(file) {
  if (file.location) return file.location;
  return `/uploads/${file.filename}`;
}

export function getStorageKey(file) {
  return file.key || file.filename;
}
