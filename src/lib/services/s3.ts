import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.S3_REGION as string,
  endpoint: process.env.S3_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  },
});

interface UploadProps {
  path: string;
  file: Buffer;
}

export async function upload({ file, path }: UploadProps) {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: path,
      Body: file,
    }),
  );

  return path;
}

interface SignedUrlProps {
  path: string;
  expiresIn?: number;
}
export async function signedUrl({ path, expiresIn }: SignedUrlProps) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME as string,
    Key: path,
  });

  const url = await getSignedUrl(s3, command, { expiresIn }).catch(() => null);
  return url;
}
