import { Prisma, PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError, z } from "zod";
import assert from "assert";

import prisma, { forUser } from "@/lib/prisma";
import { ensureSession } from "@/components/middleware/ensureSession";
import { parseAndConvertToUTC } from "@/lib/utils";

const updateLicenseSchema = z.object({
  number: z.string().optional(),
  state: z.string().optional(),
  effectiveDate: z.string().optional(),
  expirationDate: z.string().optional(),
  medicalLicenseS3Key: z.string().optional(),
});

export type PostUserLicenseParams = z.infer<typeof updateLicenseSchema>;

const updateLicense = async (
  userPrisma: PrismaClient,
  { id }: { id: string },
  data: PostUserLicenseParams
) =>
  await userPrisma.$transaction(async (tx) => {
    try {
      const license = await tx.license.update({
        where: {
          id,
        },
        data: {
          ...data,
          effectiveDate:
            data.effectiveDate && parseAndConvertToUTC(data.effectiveDate),
          expirationDate:
            data.expirationDate && parseAndConvertToUTC(data.expirationDate),
        },
      });

      return license;
    } catch (error) {
      console.error("Error creating address:", error);
      throw error;
    }
  });

export type UpdateLicenseResponse = Prisma.PromiseReturnType<
  typeof updateLicense
>;

const generateErrorMessage = (errors: ZodError) => {
  return errors.errors
    .map((err) => {
      switch (err.path[0]) {
        case "number":
          return "Number is required.";
        case "state":
          return "State is required.";
        case "medicalLicenseS3Key":
          return "Medical license is required.";
        case "effectiveDate":
          return "Effective date is required.";
        case "expirationDate":
          return "Expiration date is required.";
        default:
          return "Invalid data provided.";
      }
    })
    .join(" ");
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateLicenseResponse | { error: string }>
) {
  const { account } = await ensureSession(req, res);

  const userPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (req.method === "PATCH") {
    try {
      const { id } = req.query;
      assert(typeof id === "string");
      const parsedBody = updateLicenseSchema.parse(req.body);

      const licenseFound = await userPrisma.license.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
        },
      });

      if (!licenseFound) {
        return res.status(404).json({ error: "License not found" });
      }

      const license = await updateLicense(userPrisma, { id }, parsedBody);

      return res.json(license);
    } catch (e) {
      if (e instanceof ZodError) {
        const customErrorMessage = generateErrorMessage(e);
        return res.status(400).json({ error: customErrorMessage });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
