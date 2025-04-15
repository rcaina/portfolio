import type { NextApiRequest, NextApiResponse } from "next";
import { OrganizationType, Prisma, PrismaClient, Role } from "@prisma/client";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import ActivateResearchAccountTemplate from "@/components/email/ActivateResearchAccountTemplate";
import Stripe from "stripe";
import { generateErrorMessage } from "@/lib/utils";
import { isEmpty } from "lodash-es";
import { sendEmail } from "@/lib/email/utils";
import { thirdPartyAuthMiddleware } from "@/components/middleware/thirdPartyAuthMiddleware";

if (!process.env.STRIPE_PRIVATE_KEY) {
  throw new Error("STRIPE_PUBLIC_KEY env var");
}

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY, {
  apiVersion: "2023-08-16",
  typescript: true,
});

const ResearchAccountCreateFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  role: z.string().min(1),
  address: z.object({
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().min(1),
    country: z.string().min(1),
  }),
  billingAddress: z.object({
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().min(1),
    country: z.string().min(1),
  }),
  billingEmails: z.array(z.string().email()),
});

export type ResearchAccountCreateParams = z.infer<
  typeof ResearchAccountCreateFormSchema
>;

const researchAccountCreate = async (
  creditedRetoolUserEmail: string,
  retoolPrisma: PrismaClient,
  {
    name,
    email,
    role,
    firstName,
    lastName,
    address,
    billingAddress,
    billingEmails,
  }: ResearchAccountCreateParams
) =>
  await retoolPrisma.$transaction(async (tx) => {
    if (!isEmpty(firstName) && !isEmpty(lastName)) {
      const stripeUser = await stripe.customers.create({
        name: name,
        email: email,
        address: {
          line1: billingAddress.addressLine1,
          line2: billingAddress.addressLine2 || "",
          city: billingAddress.city,
          country: billingAddress.country === "USA" ? "US" : "",
          state: billingAddress.state,
          postal_code: billingAddress.zip,
        },
        shipping: {
          name: name,
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

      const fullName = `${firstName} ${lastName}`;

      try {
        const user = await tx.employee.create({
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
                    type: OrganizationType.RESEARCH,
                    billingEmails,
                    addresses: {
                      create: {
                        label: "Default Shipping Address",
                        addressLine1: address.addressLine1,
                        addressLine2: address.addressLine2,
                        city: address.city,
                        state: address.state,
                        zip: address.zip,
                        country: address.country,
                        default: true,
                      },
                    },
                    billingAddresses: {
                      create: {
                        label: "Default Billing Address",
                        addressLine1: billingAddress.addressLine1,
                        addressLine2: billingAddress.addressLine2,
                        city: billingAddress.city,
                        state: billingAddress.state,
                        zip: billingAddress.zip,
                        country: billingAddress.country,
                        default: true,
                      },
                    },
                  },
                },
              },
            },
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            accounts: {
              select: {
                organization: {
                  select: {
                    id: true,
                    name: true,
                    billingAddresses: true,
                  },
                },
              },
            },
          },
        });

        sendEmail({
          toEmail: email,
          subject: `Resonant Account!`,
          html: ActivateResearchAccountTemplate({
            name: fullName,
            companyName: user.accounts[0].organization.name,
            email: user.email,
          }),
          retoolUserEmail: creditedRetoolUserEmail,
        });

        return user;
      } catch (error) {
        console.error("Error creating account from retool:", error);
        throw error;
      }
    } else {
      throw new Error("First name or last name is empty");
    }
  });

export type PostResearchAccountCreateResponse = Prisma.PromiseReturnType<
  typeof researchAccountCreate
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    PostResearchAccountCreateResponse | { message: string } | { error: string }
  >
) {
  if (!(await thirdPartyAuthMiddleware(req, res))) return;

  const retool_user = req.headers["x-retool-user"] as string;
  const retoolPrisma = prisma.$extends(
    forUser(undefined, retool_user)
  ) as PrismaClient;

  if (req.method === "POST") {
    try {
      const parsedBody = ResearchAccountCreateFormSchema.parse(req.body);

      const currentUser = await retoolPrisma.employee.findUnique({
        where: {
          email: parsedBody.email,
        },
      });

      if (currentUser) {
        return res.status(401).json({ error: "Email already in use" });
      }

      const user = await researchAccountCreate(
        retool_user,
        retoolPrisma,
        parsedBody
      );

      return res.json(user);
    } catch (e) {
      if (e instanceof ZodError) {
        const customErrorMessage = generateErrorMessage(e);
        return res.status(400).json({ error: customErrorMessage });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    try {
      const { ids } = req.body as { ids: string[] };

      if (ids.length === 0) {
        return res.status(400).json({ error: "No ids provided" });
      }

      const user = await retoolPrisma.organization.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        select: {
          id: true,
        },
      });

      if (user.length !== ids.length) {
        return res
          .status(404)
          .json({ error: "One or more selected accounts not found" });
      }

      await retoolPrisma.organization.updateMany({
        where: {
          id: {
            in: ids,
          },
        },
        data: {
          deleted: true,
        },
      });

      // await retoolPrisma.account.updateMany({
      //   where: {
      //     organizationId: {
      //       in: ids,
      //     },
      //   },
      //   data: {
      //     deleted: true,
      //   },
      // });

      return res.json({ message: "Selected account(s) deleted successfully" });
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
