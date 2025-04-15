import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextApiRequest, NextApiResponse } from "next";

import JSZip from "jszip";
import { ensureArray } from "@/lib/utils";
import { ensureSession } from "@/components/middleware/ensureSession";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import prisma from "@/lib/prisma";
import s3Client from "@/lib/s3";

//fetch the S3 objects from AWS S3
async function fetchS3Object(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_MACHINE_DATA_BUCKETNAME,
    Key: key,
  });
  try {
    const response = await s3Client.send(command);
    return response.Body;
  } catch (error) {
    throw new Error(`Error fetching S3 object for key ${key}: ${error}`);
  }
}
//add fetched s3files to corresponding folder
async function mapS3Keys(S3Keys: string[], targetFolder: JSZip | null) {
  const promises = S3Keys.map(async (key) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s3Stream: any = await fetchS3Object(key);
      const fileName = key.split("/").pop();

      if (fileName) {
        targetFolder?.file(fileName, s3Stream);
      }
    } catch (error) {
      throw new Error(`Error fetching S3 object for key ${key}: ${error}`);
    }
  });
  await Promise.all(promises);
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { account } = await ensureSession(req, res);

  if (req.method === "POST") {
    const { selectedIds } = req.body;
    const userCompany = account.organizationId;

    if (selectedIds.length > 5) {
      return res.status(400).json({
        message: "You can only download up to 5 samples at a time.",
      });
    }

    try {
      const specimens = await prisma.specimen.findMany({
        where: {
          id: { in: ensureArray(selectedIds) },
          deleted: false,
        },
        select: {
          resultS3Key: true,
          serviceRequest: {
            select: {
              order: {
                select: {
                  organizationId: true,
                },
              },
            },
          },
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resultsS3Keys: any =
        specimens.length > 0 &&
        specimens
          .map((specimen) => specimen.resultS3Key)
          .filter((key) => key !== null);

      const allMatchUserCompany =
        specimens.length > 0 &&
        specimens.every(
          (specimen) =>
            specimen.serviceRequest.order?.organizationId &&
            specimen.serviceRequest.order?.organizationId === userCompany
        );

      if ([resultsS3Keys].some((keys) => keys.length !== selectedIds.length)) {
        return res.status(400).json({
          message: "Some of the selected specimen do not have results.",
        });
      }

      if (!allMatchUserCompany) {
        return res
          .status(403)
          .json({ message: "Not all specimen match the user's company." });
      }

      try {
        const zip = new JSZip();
        await mapS3Keys(resultsS3Keys, zip.folder("reports"));

        const WBLData = `specimen-results-${nanoid()}.zip`;
        const zipContent = await zip.generateAsync({ type: "nodebuffer" });

        const putCommand = new PutObjectCommand({
          Bucket: process.env.S3ZIPBUCKETNAME,
          Key: WBLData,
          Body: zipContent,
          ContentType: "application/zip",
        });
        await s3Client.send(putCommand);

        const getObjectCommand = new GetObjectCommand({
          Bucket: process.env.S3ZIPBUCKETNAME,
          Key: WBLData,
          ResponseContentDisposition: `attachment; filename="specimen-results.zip"`,
        });

        const presignedUrl = await getSignedUrl(s3Client, getObjectCommand, {
          expiresIn: 3600,
        });

        res.status(200).json({ url: presignedUrl });
      } catch (error) {
        res.status(500).send({ error: "Error processing request" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error processing request" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
