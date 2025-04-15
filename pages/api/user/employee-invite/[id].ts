import { Employee, PracticeType, PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import { addSevenHours } from "@/lib/utils";
import assert from "assert";
import { ensureSession } from "@/components/middleware/ensureSession";

const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z
    .string()
    .refine(
      (value) =>
        /^[0-9]+$/.test(value.replace(/-/g, "")) &&
        (value.length === 10 || (value.length === 12 && value.includes("-"))),
      {
        message:
          "Phone number must be 10 digits and can optionally include dashes",
      }
    )
    .transform((value) => value.replace(/-/g, ""))
    .optional(),
  practiceType: z.string().optional(),
  nationalProviderId: z.string().optional(),
  governmentIdS3Key: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseEffectiveDate: z.string().optional(),
  licenseExpirationDate: z.string().optional(),
  medicalLicenseS3Key: z.string().optional(),
});

export type UpdateUserParams = z.infer<typeof updateUserSchema>;

const updateInvitedEmployee = async (
  userPrisma: PrismaClient,
  id: string,
  {
    firstName,
    lastName,
    phoneNumber,
    practiceType,
    nationalProviderId,
    governmentIdS3Key,
    licenseNumber,
    licenseEffectiveDate,
    licenseExpirationDate,
    medicalLicenseS3Key,
  }: UpdateUserParams
) =>
  await userPrisma.$transaction(async (tx) => {
    const user = await tx.employee.update({
      where: {
        id: id,
      },
      data: {
        firstName,
        lastName,
        fullName:
          firstName && lastName ? `${firstName} ${lastName}` : undefined,
        phoneNumber: phoneNumber ? phoneNumber : undefined,
        practiceType: practiceType ? (practiceType as PracticeType) : undefined,
        nationalProviderId: nationalProviderId,
        governmentIdS3Key: governmentIdS3Key,
        licenses:
          licenseNumber &&
          licenseEffectiveDate &&
          licenseExpirationDate &&
          medicalLicenseS3Key
            ? {
                create: {
                  number: licenseNumber,
                  effectiveDate: addSevenHours(licenseEffectiveDate),
                  expirationDate: addSevenHours(licenseExpirationDate),
                  medicalLicenseS3Key: medicalLicenseS3Key,
                  state: "UT",
                },
              }
            : undefined,
      },
      include: {
        accounts: {
          select: {
            id: true,
          },
        },
      },
    });

    return user;
  });

const generateErrorMessage = (errors: ZodError) => {
  return errors.errors
    .map((err) => {
      switch (err.path[0]) {
        case "firstName":
          return "First name is required.";
        case "lastName":
          return "Last name is required.";
        case "phoneNumber":
          return "Phone number is invalid.";
        default:
          return err.message;
      }
    })
    .join(", ");
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Employee | { error: string }>
) {
  const { account } = await ensureSession(req, res);

  const userPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (req.method === "PATCH") {
    try {
      const { id } = req.query;
      assert(typeof id === "string");
      const parsedBody = updateUserSchema.parse(req.body);
      const {
        firstName,
        lastName,
        phoneNumber,
        practiceType,
        nationalProviderId,
        governmentIdS3Key,
        licenseNumber,
        licenseEffectiveDate,
        licenseExpirationDate,
        medicalLicenseS3Key,
      } = parsedBody;

      const user = await updateInvitedEmployee(userPrisma, id, {
        firstName,
        lastName,
        phoneNumber,
        practiceType,
        nationalProviderId,
        governmentIdS3Key,
        licenseNumber,
        licenseEffectiveDate,
        licenseExpirationDate,
        medicalLicenseS3Key,
      });

      return res.json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        const customErrorMessage = generateErrorMessage(error);
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
