import { env } from "process";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import assert from "assert";

import { LOCAL } from "./utils";

assert(env.S3_REGION);
assert(env.ENVIRONMENT);

declare global {
  // eslint-disable-next-line no-var
  var s3Client: S3Client | undefined;
}

const isLocalEnvironment = env.ENVIRONMENT === LOCAL;

isLocalEnvironment && assert(env.NEXT_PUBLIC_S3ENDPOINT);
isLocalEnvironment && assert(env.S3_ACCESS_KEY_ID);
isLocalEnvironment && assert(env.S3_SECRET_ACCESS_KEY);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const s3Config: any = isLocalEnvironment
  ? {
      endpoint: env.NEXT_PUBLIC_S3ENDPOINT,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
      apiVersion: "v4",
      region: env.S3_REGION,
    }
  : {
      forcePathStyle: true,
      apiVersion: "v4",
      region: env.S3_REGION,
    };

const s3Client = new S3Client(s3Config);

if (process.env.NODE_ENV === "development") global.s3Client = s3Client;

export const getS3BucketInvoice = async (bucket: string, s3Key: string) => {
  const getObjectCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: s3Key || "",
  });
  const { Body } = await s3Client.send(getObjectCommand);

  return Body;
};

export const getS3BucketReport = async (bucket: string, s3Key: string) => {
  const getObjectCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: s3Key || "",
  });
  const { Body } = await s3Client.send(getObjectCommand);
  return Body;
};

export const getS3BucketRawData = async (bucket: string, s3Key: string) => {
  const getObjectCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: s3Key || "",
  });
  const { Body } = await s3Client.send(getObjectCommand);
  return Body;
};

export default s3Client;
