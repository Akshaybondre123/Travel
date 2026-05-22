import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { s3Client, s3Bucket, s3Enabled } from '../config/s3.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localDir = path.join(__dirname, '../../uploads');

fs.mkdirSync(localDir, { recursive: true });

const useLocal = process.env.USE_LOCAL_STORAGE === 'true' || !s3Enabled;

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
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, localDir),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
}

export const upload = multer({
  storage: !useLocal
    ? multerS3({
        s3: s3Client,
        bucket: s3Bucket,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (_req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `bookings/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
        },
      })
    : localStorage(),
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
