import { GetObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs/promises';
import path from 'path';
import { s3Client, s3Enabled } from '../config/s3.js';

async function streamToBuffer(body) {
  const chunks = [];
  for await (const chunk of body) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export async function getFileBuffer({ fileUrl, localPath, storageKey }) {
  if (localPath) {
    return fs.readFile(localPath);
  }

  if (storageKey && s3Enabled && s3Client) {
    const res = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: storageKey,
      })
    );
    return streamToBuffer(res.Body);
  }

  if (fileUrl?.startsWith('http')) {
    const res = await fetch(fileUrl);
    if (!res.ok) {
      throw new Error(
        'Failed to fetch file from storage. Use S3 credentials or enable public bucket access.'
      );
    }
    return Buffer.from(await res.arrayBuffer());
  }

  const filename = fileUrl.replace(/^\/uploads\//, '');
  return fs.readFile(path.join(process.cwd(), 'uploads', filename));
}
