/** True on Vercel, AWS Lambda, etc. — no writable local disk */
export const isServerless =
  Boolean(process.env.VERCEL) ||
  Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
  Boolean(process.env.LAMBDA_TASK_ROOT);

export const useS3Storage =
  Boolean(process.env.AWS_ACCESS_KEY_ID) &&
  Boolean(process.env.AWS_SECRET_ACCESS_KEY) &&
  Boolean(process.env.AWS_S3_BUCKET);

export function assertUploadConfig() {
  if (isServerless && !useS3Storage) {
    throw new Error(
      'Serverless deploy requires AWS S3. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET in Vercel environment variables.'
    );
  }
}
