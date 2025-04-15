import { Employee, Patient, PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import { ensureSession } from "@/components/middleware/ensureSession";

const updateUserSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
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
    .transform((value) => value.replace(/-/g, "")),
  role: z.string().min(1),
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
        case "role":
          return "Role is required.";
        default:
          return err.message;
      }
    })
    .join(", ");
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    Patient | Employee | undefined | { message: string } | { error: string }
  >
) {
  const { account } = await ensureSession(req, res);

  const userPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (req.method === "PUT") {
    try {
      const parsedBody = updateUserSchema.parse(req.body);

      const { firstName, lastName, phoneNumber } = parsedBody;

      const user = await userPrisma.employee.update({
        where: {
          id: account.employeeId,
        },
        data: {
          firstName,
          lastName,
          phoneNumber,
        },
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
