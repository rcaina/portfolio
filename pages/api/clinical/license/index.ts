import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Role } from "@prisma/client";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import { ensureSession } from "@/components/middleware/ensureSession";
import { parseAndConvertToUTC } from "@/lib/utils";

const createLicenseSchema = z.object({
  number: z.string().min(1),
  state: z.string().min(1),
  medicalLicenseS3Key: z.string().min(1),
  effectiveDate: z.string().min(1),
  expirationDate: z.string().min(1),
  employeeId: z.string().min(1),
});

export type PostUserLicenseParams = z.infer<typeof createLicenseSchema>;

const createLicense = async (
  licensePrisma: PrismaClient,
  {
    number,
    state,
    medicalLicenseS3Key,
    effectiveDate,
    expirationDate,
    employeeId,
  }: PostUserLicenseParams
) =>
  await licensePrisma.license.create({
    data: {
      number,
      state,
      medicalLicenseS3Key,
      effectiveDate: parseAndConvertToUTC(effectiveDate),
      expirationDate: parseAndConvertToUTC(expirationDate),
      practitioner: {
        connect: {
          id: employeeId,
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

const allowedRoles: Role[] = [Role.STAFF, Role.PRACTITIONER];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateLicenseResponse | { error: string }>
) {
  const { account } = await ensureSession(req, res);

  const licensePrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (!allowedRoles.includes(account.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (req.method === "POST") {
    try {
      const parsedBody = createLicenseSchema.parse(req.body);

      const employee = await licensePrisma.employee.findUnique({
        where: {
          id: parsedBody.employeeId,
        },
        include: {
          accounts: true,
        },
      });

      if (!employee || !employee.accounts) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const organizationIds = employee.accounts.map(
        (account) => account.organizationId
      );

      if (!organizationIds.includes(account.organizationId)) {
        return res
          .status(404)
          .json({ error: "You do not have access to this employee" });
      }

      const duplicateLicenseNumber = await licensePrisma.license.findMany({
        where: {
          number: parsedBody.number,
          deleted: false,
        },
      });

      if (duplicateLicenseNumber.length > 0) {
        return res.status(400).json({ error: "License number already exists" });
      }

      const license = await createLicense(licensePrisma, parsedBody);

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
