import {
  LicenseStatus,
  PracticeType,
  Prisma,
  PrismaClient,
  Role,
} from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import Stripe from "stripe";
import WelcomeRegisteredUserTemplate from "@/components/email/WelcomeRegisteredUserTemplate";
import { authOptions } from "../auth/[...nextauth]";
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
  practiceType: z.string().min(1),
  nationalProviderId: z.string().min(1),
  governmentIdS3Key: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseEffectiveDate: z.string(),
  licenseExpirationDate: z.string(),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
  medicalLicenseS3Key: z.string().min(1),
});

export type PostUserParams = z.infer<typeof practitionerSignUpSchema>;

const registerPractitioner = async (
  signUpPrisma: PrismaClient,
  {
    name,
    email,
    firstName,
    lastName,
    practiceType,
    nationalProviderId,
    licenseNumber,
    licenseEffectiveDate,
    licenseExpirationDate,
    addressLine1,
    addressLine2,
    city,
    state,
    zip,
    country,
    governmentIdS3Key,
    medicalLicenseS3Key,
  }: PostUserParams
) =>
  await signUpPrisma.$transaction(async (tx) => {
    if (!isEmpty(firstName) && !isEmpty(lastName)) {
      const fullName = `${firstName} ${lastName}`;
      const eDate = new Date(licenseEffectiveDate);
      const expDate = new Date(licenseExpirationDate);
      const effDate = new Date(eDate.setUTCHours(0, 0, 0, 0));
      const expDate1 = new Date(expDate.setUTCHours(0, 0, 0, 0));

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

      try {
        const practitioner = await tx.employee.create({
          data: {
            email,
            fullName,
            firstName,
            lastName,
            practiceType: practiceType.toUpperCase() as PracticeType,
            nationalProviderId,
            accounts: {
              create: {
                role: Role.PRACTITIONER,
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
            licenses: {
              create: {
                number: licenseNumber,
                status: LicenseStatus.PENDING_APPROVAL,
                effectiveDate: effDate,
                expirationDate: expDate1,
                state: state,
                medicalLicenseS3Key,
              },
            },
            governmentIdS3Key,
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
            name: practitioner.fullName,
          }),
        });

        return practitioner;
      } catch (error) {
        console.error("Error creating practitioner:", error);
        throw error;
      }
    } else {
      throw new Error("First name or last name is empty");
    }
  });

export type PostUserResponse = Prisma.PromiseReturnType<
  typeof registerPractitioner
>;

const generateErrorMessage = (errors: ZodError) => {
  return errors.errors
    .map((err) => {
      switch (err.path[0]) {
        case "name":
          return "Name is required.";
        case "email":
          return "Email is required.";
        case "firstName":
          return "First name is required.";
        case "lastName":
          return "Last name is required.";
        case "role":
          return "Role is required.";
        case "practiceType":
          return "Practice type is required.";
        case "nationalProviderId":
          return "National Provider ID is required.";
        case "governmentIdS3Key":
          return "Government ID is required.";
        case "licenseNumber":
          return "License number is required.";
        case "licenseEffectiveDate":
          return "License effective date is required.";
        case "licenseExpirationDate":
          return "License expiration date is required.";
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
        case "medicalLicenseS3Key":
          return "Medical License is required.";
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

  const signUpPrisma = prisma.$extends(forUser(undefined)) as PrismaClient;

  if (req.method === "POST") {
    try {
      const parsedBody = practitionerSignUpSchema.parse(req.body);

      const currentUser = await signUpPrisma.employee.findUnique({
        where: {
          email: parsedBody.email,
        },
      });

      if (currentUser) {
        return res.status(401).json({ error: "Email already in use" });
      }
      const user = await registerPractitioner(signUpPrisma, parsedBody);

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
