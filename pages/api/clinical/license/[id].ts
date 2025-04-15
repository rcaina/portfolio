import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Role } from "@prisma/client";
import { ZodError, z } from "zod";
import { organizationAllowedRoles, parseAndConvertToUTC } from "@/lib/utils";
import prisma, { forUser } from "@/lib/prisma";

import assert from "assert";
import { ensureSession } from "@/components/middleware/ensureSession";

const updateEmployeeLicenseSchema = z.object({
  employeeId: z.string().min(1),
  number: z.string().min(1),
  state: z.string().min(1),
  medicalLicenseS3Key: z.string().min(1),
  effectiveDate: z.string().min(1),
  expirationDate: z.string().min(1),
});

export type UpdateEmployeeLicenseParams = z.infer<
  typeof updateEmployeeLicenseSchema
>;

const updateEmployeeLicense = async (
  licensePrisma: PrismaClient,
  id: string,
  data: UpdateEmployeeLicenseParams
) =>
  await licensePrisma.$transaction(async (tx) => {
    try {
      await tx.license.update({
        where: {
          id,
        },
        data: {
          deleted: true,
        },
      });

      const license = await tx.license.create({
        data: {
          number: data.number,
          state: data.state,
          medicalLicenseS3Key: data.medicalLicenseS3Key,
          effectiveDate: parseAndConvertToUTC(data.effectiveDate),
          expirationDate: parseAndConvertToUTC(data.expirationDate),
          practitioner: {
            connect: {
              id: data.employeeId,
            },
          },
        },
      });

      return license;
    } catch (error) {
      console.error("Error creating license:", error);
      throw error;
    }
  });

export type UpdateEmployeeLicenseResponse = Prisma.PromiseReturnType<
  typeof updateEmployeeLicense
>;

const generateErrorMessage = (errors: ZodError) => {
  return errors.errors
    .map((err) => {
      switch (err.path[0]) {
        case "number":
          return "Number is required.";
        case "state":
          return "state is required.";
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
  res: NextApiResponse<UpdateEmployeeLicenseResponse | { error: string }>
) {
  const { account } = await ensureSession(req, res);

  const licensePrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (!organizationAllowedRoles.includes(account.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { id } = req.query;
  assert(typeof id === "string");

  const parsedBody = updateEmployeeLicenseSchema.parse(req.body);

  const employeeAccount = await licensePrisma.account.findUnique({
    where: {
      employeeId_organizationId: {
        employeeId: parsedBody.employeeId,
        organizationId: account.organizationId,
      },
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!employeeAccount) {
    return res.status(404).json({ error: "Employee not found" });
  }
  if (employeeAccount.role !== Role.PRACTITIONER) {
    return res.status(404).json({ error: "Employee is not a practitioner" });
  }

  if (req.method === "PUT") {
    const licenseFound = await licensePrisma.license.findUnique({
      where: {
        id: id,
      },
    });

    if (!licenseFound) {
      return res.status(404).json({ error: "License not found to update" });
    }

    try {
      const license = await updateEmployeeLicense(
        licensePrisma,
        id,
        parsedBody
      );

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
