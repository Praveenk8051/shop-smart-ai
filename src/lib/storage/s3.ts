import AWS from 'aws-sdk';

// Configure AWS SDK
const s3Config = {
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

// Initialize S3 client
const s3 = new AWS.S3(s3Config);

// Set bucket name from environment variables
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'dummy-tshirt-designs-bucket';

/**
 * Uploads file buffer to S3
 */
export const uploadToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{ key: string; url: string }> => {
  // For demo purposes, if no AWS credentials are provided, return dummy values
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log('Using dummy S3 upload (no AWS credentials provided)');
    const dummyKey = `uploads/${Date.now()}-${fileName}`;
    return {
      key: dummyKey,
      url: `https://example-bucket.s3.amazonaws.com/${dummyKey}`,
    };
  }

  // Create unique file name to prevent overwriting
  const key = `uploads/${Date.now()}-${fileName}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    // Make it publicly accessible
    ACL: 'public-read',
  };

  try {
    await s3.upload(params).promise();
    // Construct the URL
    const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
    return { key, url };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

/**
 * Deletes a file from S3
 */
export const deleteFromS3 = async (key: string): Promise<void> => {
  // For demo purposes, if no AWS credentials are provided, just return
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log(`Using dummy S3 delete for key: ${key}`);
    return;
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
};

/**
 * Generates a signed URL for temporary access to a private S3 object
 */
export const getSignedUrl = async (
  key: string,
  expiresIn: number = 3600
): Promise<string> => {
  // For demo purposes, if no AWS credentials are provided, return dummy value
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log(`Using dummy S3 signed URL for key: ${key}`);
    return `https://example-bucket.s3.amazonaws.com/${key}?signed=dummy`;
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: expiresIn,
  };

  try {
    return s3.getSignedUrlPromise('getObject', params);
  } catch (error) {
    console.error('S3 signed URL error:', error);
    throw new Error('Failed to generate signed URL');
  }
};