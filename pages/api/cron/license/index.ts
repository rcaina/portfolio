import { License, LicenseStatus, Prisma } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";

const updateExpiredLicenses = async (licenses: License[]) =>
  await Promise.all(
    licenses.map(async (license) => {
      return await prisma.license.update({
        where: {
          id: license.id,
        },
        data: {
          status: LicenseStatus.EXPIRED,
        },
        select: {
          id: true,
          status: true,
        },
      });
    })
  );

export type UpdateExpiredLicenseResponse = Prisma.PromiseReturnType<
  typeof updateExpiredLicenses
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    UpdateExpiredLicenseResponse | { message: string } | { error: string }
  >
) {
  if (req.headers["github-api-key"] !== process.env.CRON_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    try {
      const licenses = await prisma.license.findMany({
        where: {
          expirationDate: {
            lte: new Date(),
          },
        },
      });

      if (licenses.length > 0) {
        const license = await updateExpiredLicenses(licenses);

        return res.json(license);
      }
      return res.json({ message: "No licenses to update" });
    } catch (e) {
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
