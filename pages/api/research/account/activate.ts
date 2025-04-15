import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import WelcomeRegisteredUserTemplate from "@/components/email/WelcomeRegisteredUserTemplate";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getPasswordHash } from "@/pages/api/reset/password";
import { getServerSession } from "next-auth";
import { sendEmail } from "@/lib/email/utils";

const employeeSignUpSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
});

const updateEmployeeAccountSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  email: z.string().email(),
});

export type PostUserParams = z.infer<typeof employeeSignUpSchema>;
export type PostUpdateUserParams = z.infer<typeof updateEmployeeAccountSchema>;

const createEmployeeAccount = async (
  creditedUserId: string,
  activationPrisma: PrismaClient,
  { firstName, lastName, email, phoneNumber }: PostUserParams
) =>
  await activationPrisma.$transaction(async (tx) => {
    const employee = await tx.employee.update({
      where: {
        id: creditedUserId,
      },
      data: {
        fullName: `${firstName} ${lastName}`,
        firstName,
        lastName,
        email,
        phoneNumber: phoneNumber,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        accounts: true,
      },
    });

    sendEmail({
      toEmail: employee.email,
      subject: `Welcome to Resonant!`,
      html: WelcomeRegisteredUserTemplate({
        name: `${employee.fullName}`,
      }),
      userId: creditedUserId,
    });

    return employee;
  });

const updateEmployeeAccount = async (
  employeeId: string,
  activationPrisma: PrismaClient,
  { firstName, lastName, password }: PostUpdateUserParams
) =>
  await activationPrisma.employee.update({
    where: { id: employeeId },
    data: { firstName, lastName, password },
    select: {
      id: true,
      email: true,
    },
  });

export type PostCreateEmployeeAccountResponse = Prisma.PromiseReturnType<
  typeof createEmployeeAccount
>;

export type PostUpdateEmployeeAccountResponse = Prisma.PromiseReturnType<
  typeof updateEmployeeAccount
>;

const generateErrorMessage = (errors: ZodError) => {
  return errors.errors
    .map((err) => {
      switch (err.path[0]) {
        case "firstName":
          return "First name is required.";
        case "lastName":
          return "Last name is required.";
        case "password":
          return "Password is required.";
        case "confirmPassword":
          return "Confirm password is required.";
        default:
          return "Invalid data provided.";
      }
    })
    .join(" ");
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | PostCreateEmployeeAccountResponse
    | PostUpdateEmployeeAccountResponse
    | { message: string }
    | { error: string }
  >
) {
  const session = await getServerSession(req, res, authOptions);

  if (req.method === "PATCH") {
    const parsedBody = updateEmployeeAccountSchema.parse(req.body);

    const account = await prisma.employee.findUnique({
      where: {
        email: parsedBody.email,
      },
      select: {
        id: true,
      },
    });

    if (account) {
      const activationPrisma = prisma.$extends(
        forUser(account.id, undefined)
      ) as PrismaClient;

      if (parsedBody.password !== parsedBody.confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
      }

      const passwordHash = await getPasswordHash(parsedBody.password);

      if (!passwordHash) {
        return res.status(400).json({ error: "Failed to hash password" });
      }

      const user = await updateEmployeeAccount(account.id, activationPrisma, {
        firstName: parsedBody.firstName,
        lastName: parsedBody.lastName,
        password: passwordHash,
        email: parsedBody.email,
        confirmPassword: parsedBody.confirmPassword,
      });

      return res.status(200).json(user);
    } else {
      return res.status(404).json({
        error:
          "No account found with provided email. Please check email is correct or contact support.",
      });
    }
  }

  if (!session) {
    return res
      .status(400)
      .json({ error: "Bad Request: No active session found, please sign-in." });
  }

  if (req.method === "POST") {
    try {
      const parsedBody = employeeSignUpSchema.parse(req.body);

      const currentUser = await prisma.employee.findUnique({
        where: {
          email: parsedBody.email,
        },
        select: {
          id: true,
        },
      });

      if (!currentUser) {
        return res.status(400).json({ error: "User not found." });
      }

      const activationPrisma = prisma.$extends(
        forUser(currentUser.id, undefined)
      ) as PrismaClient;

      const user = await createEmployeeAccount(
        currentUser.id,
        activationPrisma,
        parsedBody
      );

      return res.status(200).json(user);
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
