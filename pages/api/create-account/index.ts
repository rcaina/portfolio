import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Role } from "@prisma/client";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import Stripe from "stripe";
import { getPasswordHash } from "../reset/password";

if (!process.env.STRIPE_PRIVATE_KEY) {
  throw new Error("STRIPE_PUBLIC_KEY env var");
}

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY, {
  apiVersion: "2023-08-16",
  typescript: true,
});

const updateUserSchema = z.object({
  organization: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
  password: z.string().min(1),
  confirmPassword: z.string().min(1),
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
        case "password":
          return "Password is required.";
        case "confirmPassword":
          return "Confirm password is required.";
        default:
          return err.message;
      }
    })
    .join(", ");
};

const createAccount = async (
  userPrisma: PrismaClient,
  data: {
    organization: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    password: string;
    confirmPassword: string;
  }
) =>
  await userPrisma.$transaction(async (tx) => {
    const stripeUser = await stripe.customers.create({
      name: data.organization,
      email: data.email,
    });

    const passwordHash = await getPasswordHash(data.password);

    if (!passwordHash) {
      throw new Error("Failed to hash password");
    }

    return await tx.employee.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: passwordHash,
        accounts: {
          create: {
            role: data.role as Role,
            organization: {
              create: {
                name: data.organization,
                stripeId: stripeUser.id,
              },
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
      },
    });
  });

type CreateAccountResponse = Prisma.PromiseReturnType<typeof createAccount>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateAccountResponse | { error: string }>
) {
  if (req.method === "POST") {
    try {
      const parsedBody = updateUserSchema.parse(req.body);
      const userPrisma = prisma.$extends(forUser(undefined)) as PrismaClient;

      const user = await createAccount(userPrisma, {
        organization: parsedBody.organization,
        firstName: parsedBody.firstName,
        lastName: parsedBody.lastName,
        email: parsedBody.email,
        role: parsedBody.role,
        password: parsedBody.password,
        confirmPassword: parsedBody.confirmPassword,
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
