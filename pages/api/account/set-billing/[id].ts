import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import Stripe from "stripe";
import assert from "assert";
import { ensureSession } from "@/components/middleware/ensureSession";

if (!process.env.STRIPE_PRIVATE_KEY) {
  throw new Error("STRIPE_PUBLIC_KEY env var");
}

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY, {
  apiVersion: "2023-08-16",
  typescript: true,
});

const billingAddressSchema = z.object({
  label: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
  billingEmails: z.array(z.string().email()).min(1),
});

export type UpdateClinicBillingParams = z.infer<typeof billingAddressSchema>;

const updateClinicBilling = async (
  accountPrisma: PrismaClient,
  id: string,
  billingAddress: UpdateClinicBillingParams
) =>
  await accountPrisma.$transaction(async (tx) => {
    const clinic = await accountPrisma.organization.findUnique({
      where: {
        id: id,
      },
    });

    if (!clinic) {
      throw new Error("Clinic not found");
    }

    const stripeUser = await stripe.customers.create({
      name: clinic.name,
      email: clinic.billingEmails[0],
      address: {
        line1: billingAddress.addressLine1,
        line2: billingAddress.addressLine2 || "",
        city: billingAddress.city,
        country: billingAddress.country === "USA" ? "US" : "",
        state: billingAddress.state,
        postal_code: billingAddress.zip,
      },
      shipping: {
        name: clinic.name,
        address: {
          line1: billingAddress.addressLine1,
          line2: billingAddress.addressLine2 || "",
          city: billingAddress.city,
          country: billingAddress.country === "USA" ? "US" : "",
          state: billingAddress.state,
          postal_code: billingAddress.zip,
        },
      },
    });

    return await tx.organization.update({
      where: {
        id: id,
      },
      data: {
        stripeId: stripeUser.id,
        billingEmails: billingAddress.billingEmails,
        billingAddresses: {
          create: {
            label: billingAddress.label,
            addressLine1: billingAddress.addressLine1,
            addressLine2: billingAddress?.addressLine2,
            city: billingAddress.city,
            state: billingAddress.state,
            zip: billingAddress.zip,
            country: billingAddress.country,
            default: true,
          },
        },
      },
    });
  });

export type UpdateClinicBillingResponse = Prisma.PromiseReturnType<
  typeof updateClinicBilling
>;

const generateErrorMessage = (errors: ZodError) => {
  return errors.errors
    .map((err) => {
      switch (err.path[0]) {
        case "id":
          return "The clinic not found.";
        case "name":
          return "The clinic name is required.";
        case "billingAddress":
          if (err.path[1] === "label") return "Label is required.";
          if (err.path[1] === "addressLine1") return "Address is required.";
          if (err.path[1] === "city") return "City is required.";
          if (err.path[1] === "state") return "State is required.";
          if (err.path[1] === "zip") return "zip code is required.";
          if (err.path[1] === "country") return "Country is required.";
          if (err.path[1] === "billingEmails")
            return "At least 1 billing email is required.";
          break;
        default:
          return err.message;
      }
    })
    .join(", ");
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateClinicBillingResponse | { error: string }>
) {
  const { account } = await ensureSession(req, res);

  const accountPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (req.method === "PUT") {
    const { id } = req.query;
    assert(typeof id === "string");
    try {
      const parsedBody = billingAddressSchema.parse(req.body);
      const clinic = await updateClinicBilling(accountPrisma, id, parsedBody);
      res.json(clinic);
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
