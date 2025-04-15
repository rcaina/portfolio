import { Prisma, PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";
import { ensureSession } from "@/components/middleware/ensureSession";
import { parseAndConvertToUTC } from "@/lib/utils";

const createLicenseSchema = z.object({
  userId: z.string().min(1),
  number: z.string().min(1),
  state: z.string().min(1),
  medicalLicenseS3Key: z.string().min(1),
  effectiveDate: z.string().min(1),
  expirationDate: z.string().min(1),
});

export type PostUserLicenseParams = z.infer<typeof createLicenseSchema>;

const createLicense = async (
  userPrisma: PrismaClient,
  id: string,
  {
    number,
    state,
    effectiveDate,
    expirationDate,
    medicalLicenseS3Key,
  }: PostUserLicenseParams
) =>
  await userPrisma.license.create({
    data: {
      number,
      state,
      medicalLicenseS3Key,
      effectiveDate: parseAndConvertToUTC(effectiveDate),
      expirationDate: parseAndConvertToUTC(expirationDate),
      practitioner: {
        connect: {
          id,
        },
      },
    },
  });

export type CreateLicenseResponse = Prisma.PromiseReturnType<
  typeof createLicense
>;

const generateErrorMessage = (errors: ZodError) => {
  return errors.errors
    .map((err) => {
      switch (err.path[0]) {
        case "userId":
          return "User is not logged in.";
        case "number":
          return "Number is required.";
        case "state":
          return "State is required.";
        case "medicalLicenseS3Key":
          return "Medical License is required.";
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
  res: NextApiResponse<CreateLicenseResponse | { error: string }>
) {
  const { account } = await ensureSession(req, res);

  const userPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (req.method === "POST") {
    try {
      const parsedBody = createLicenseSchema.parse(req.body);

      if (account.employeeId !== parsedBody.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const duplicateLicenseNumber = await userPrisma.license.findMany({
        where: {
          number: parsedBody.number,
          deleted: false,
        },
      });

      if (duplicateLicenseNumber.length > 0) {
        return res.status(400).json({ error: "License number already exists" });
      }

      const license = await createLicense(
        userPrisma,
        account.employeeId,
        parsedBody
      );

      return res.json(license);
    } catch (e) {
      if (e instanceof ZodError) {
        const customErrorMessage = generateErrorMessage(e);
        return res.status(400).json({ error: customErrorMessage });
      }
      console.error("Error creating license:", e);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
