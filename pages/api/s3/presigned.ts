import {
  DeleteObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import type { NextApiRequest, NextApiResponse } from "next";

import { S3Bucket } from "@/lib/utils";
import { S3File } from "@prisma/client";
import assert from "assert";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";
import prisma from "@/lib/prisma";
import s3Client from "@/lib/s3";
import { v4 as uuidv4 } from "uuid";

assert(
  process.env.S3_REQUISITION_FORM_BUCKETNAME,
  "S3_REQUISITION_FORM_BUCKETNAME is required"
);
assert(
  process.env.S3_MEDICAL_LICENSE_BUCKETNAME,
  "S3_MEDICAL_LICENSE_BUCKETNAME is required"
);
assert(
  process.env.S3_GOVERNMENT_ID_BUCKETNAME,
  "S3_GOVERNMENT_ID_BUCKETNAME is required"
);
assert(process.env.S3_RESULTS_BUCKETNAME, "S3_RESULTS_BUCKETNAME is required");

const SIGNED_URL_TIME_LENGTH = 3600;

const S3BucketMap = {
  [S3Bucket.REQUISITION_FORMS]: process.env.S3_REQUISITION_FORM_BUCKETNAME,
  [S3Bucket.MEDICAL_LICENSES]: process.env.S3_MEDICAL_LICENSE_BUCKETNAME,
  [S3Bucket.GOVERNMENT_IDS]: process.env.S3_GOVERNMENT_ID_BUCKETNAME,
  [S3Bucket.RESULTS]: process.env.S3_RESULTS_BUCKETNAME,
};

const isValidBucket = (bucket: string): bucket is S3Bucket => {
  return Object.values(S3Bucket).includes(bucket as S3Bucket);
};

export interface PresignedResponse {
  url: string;
  s3Key: string;
  s3FileId: string;
}

export const deleteS3Object = async (bucket: S3Bucket, files: S3File[]) => {
  for (const file of files) {
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: S3BucketMap[bucket],
      Key: file.s3Key,
    });

    try {
      await s3Client.send(deleteObjectCommand);
    } catch (error) {
      return {
        error: `Error deleting object ${file.s3Key}:`,
      };
    }
  }
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { title, type, bucket } = req.body;

  const ext = path.extname(title);
  const key = `${uuidv4()}${ext}`;

  if (!isValidBucket(bucket)) {
    return res.status(400).json({ error: "Invalid bucket specified" });
  }

  const bucketName = S3BucketMap[bucket];

  if (!bucketName) {
    return res.status(400).json({ error: "Invalid bucket specified" });
  }

  const bucketParams: PutObjectCommandInput = {
    Bucket: bucketName,
    Key: key,
    ContentType: type,
  };

  try {
    // Create a command to put the object in the S3 bucket.
    const command = new PutObjectCommand(bucketParams);
    // Create the presigned URL.
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: SIGNED_URL_TIME_LENGTH,
    });

    const s3File = await prisma.s3File.create({
      data: {
        s3Key: key,
        fileName: title,
      },
    });

    const response: PresignedResponse = {
      url: signedUrl,
      s3Key: key,
      s3FileId: s3File.id,
    };
    res.send(response);
  } catch (err) {
    console.error("Error creating presigned URL:", err);
    res.status(500).send("Server error");
  }
}
