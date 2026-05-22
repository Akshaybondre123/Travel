import { S3Client } from '@aws-sdk/client-s3';

export const s3Enabled =
  Boolean(process.env.AWS_ACCESS_KEY_ID) &&
  Boolean(process.env.AWS_SECRET_ACCESS_KEY) &&
  Boolean(process.env.AWS_S3_BUCKET);

export const s3Client = s3Enabled
  ? new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

export const s3Bucket = process.env.AWS_S3_BUCKET;
