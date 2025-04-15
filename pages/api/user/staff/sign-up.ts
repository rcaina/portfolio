import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Role } from "@prisma/client";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import Stripe from "stripe";
import WelcomeRegisteredUserTemplate from "@/components/email/WelcomeRegisteredUserTemplate";
import { authOptions } from "../../auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { isEmpty } from "lodash-es";
import { sendEmail } from "@/lib/email/utils";

if (!process.env.STRIPE_PRIVATE_KEY) {
  throw new Error("STRIPE_PUBLIC_KEY env var");
}

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY, {
  apiVersion: "2023-08-16",
  typescript: true,
});

const practitionerSignUpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
});

export type PostUserParams = z.infer<typeof practitionerSignUpSchema>;

const registerPractitioner = async (
  userPrisma: PrismaClient,
  {
    name,
    role,
    email,
    firstName,
    lastName,
    addressLine1,
    addressLine2,
    city,
    state,
    zip,
    country,
  }: PostUserParams
) =>
  await userPrisma.$transaction(async (tx) => {
    if (!isEmpty(firstName) && !isEmpty(lastName)) {
      const fullName = firstName + " " + lastName;

      const stripeUser = await stripe.customers.create({
        name: name,
        email: email,
        address: {
          line1: addressLine1,
          line2: addressLine2 || "",
          city: city,
          country: country === "USA" ? "US" : "",
          state: state,
          postal_code: zip,
        },
      });

      const staff = await tx.employee.create({
        data: {
          email,
          fullName,
          firstName,
          lastName,
          accounts: {
            create: {
              role: role as Role,
              accountOwner: true,
              organization: {
                create: {
                  stripeId: stripeUser.id,
                  name,
                  addresses: {
                    create: {
                      label: "Default Shipping Address",
                      addressLine1,
                      addressLine2,
                      city,
                      state,
                      zip,
                      country,
                      default: true,
                    },
                  },
                  project: {
                    create: {
                      name: "Default Project",
                      leadName: "General",
                    },
                  },
                },
              },
            },
          },
        },
        include: {
          accounts: {
            select: {
              id: true,
            },
          },
        },
      });

      sendEmail({
        toEmail: email,
        subject: `Welcome to Resonant!`,
        html: WelcomeRegisteredUserTemplate({
          name: `${firstName} ${lastName}`,
        }),
      });
      return staff;
    }
  });

export type PostUserResponse = Prisma.PromiseReturnType<
  typeof registerPractitioner
>;

const generateErrorMessage = (errors: ZodError) => {
  return errors.errors
    .map((err) => {
      switch (err.path[0]) {
        case "email":
          return "Email is required.";
        case "firstName":
          return "First name is required.";
        case "lastName":
          return "Last name is required.";
        case "role":
          return "Role is required.";
        case "addressLine1":
          return "Address is required.";
        case "city":
          return "City is required.";
        case "state":
          return "State is required.";
        case "zip":
          return "Zip is required.";
        case "country":
          return "Country is required.";
        default:
          return "Invalid data provided.";
      }
    })
    .join(" ");
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PostUserResponse | { error: string }>
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userPrisma = prisma.$extends(forUser(undefined)) as PrismaClient;

  if (req.method === "POST") {
    try {
      const parsedBody = practitionerSignUpSchema.parse(req.body);

      const currentUser = await userPrisma.employee.findUnique({
        where: {
          email: parsedBody.email,
        },
      });

      if (currentUser) {
        return res.status(401).json({ error: "Email already in use" });
      }

      const user = await registerPractitioner(userPrisma, parsedBody);

      return res.json(user);
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
