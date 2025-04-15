import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import { ensureSession } from "@/components/middleware/ensureSession";

const createAddressSchema = z.object({
  accountId: z.string().min(1),
  organizationId: z.string().min(1),
  isBilling: z.boolean(),
  isDefault: z.boolean(),
  label: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
});

export type PostAddressParams = z.infer<typeof createAddressSchema>;

const createAddress = async (
  addressPrisma: PrismaClient,
  {
    organizationId,
    isBilling,
    isDefault,
    label,
    addressLine1,
    addressLine2,
    city,
    state,
    zip,
    country,
  }: PostAddressParams
) =>
  await addressPrisma.$transaction(async (tx) => {
    try {
      if (isDefault) {
        const clinic = await tx.organization.findUnique({
          where: {
            id: organizationId,
          },
          select: {
            addresses: {
              where: {
                default: true,
              },
            },
            billingAddresses: {
              where: {
                default: true,
              },
            },
          },
        });

        if (isBilling && clinic?.addresses[0]) {
          await tx.address.update({
            where: {
              id: clinic.addresses[0].id,
            },
            data: {
              default: false,
            },
          });
        } else if (!isBilling && clinic?.billingAddresses[0]) {
          await tx.address.update({
            where: {
              id: clinic.billingAddresses[0].id,
            },
            data: {
              default: false,
            },
          });
        }
      }

      const address = await tx.address.create({
        data: {
          label,
          addressLine1,
          addressLine2,
          city,
          state,
          zip,
          country,
          default: isDefault,
        },
      });

      await tx.organization.update({
        where: {
          id: organizationId,
        },
        data: isBilling
          ? {
              addresses: {
                connect: {
                  id: address.id,
                },
              },
            }
          : {
              billingAddresses: {
                connect: {
                  id: address.id,
                },
              },
            },
      });

      return address;
    } catch (error) {
      console.error("Error creating address:", error);
      throw error;
    }
  });

export type CreateAddressResponse = Prisma.PromiseReturnType<
  typeof createAddress
>;

const generateErrorMessage = (errors: ZodError) => {
  return errors.errors
    .map((err) => {
      switch (err.path[0]) {
        case "accountId":
          return "accountId is required.";
        case "organizationId":
          return "organizationId is required.";
        case "isBilling":
          return "address type required.";
        case "default":
          return "default type required.";
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
  res: NextApiResponse<CreateAddressResponse | { error: string }>
) {
  const { account } = await ensureSession(req, res);

  const addressPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (req.method === "POST") {
    try {
      const parsedBody = createAddressSchema.parse(req.body);
      const address = await createAddress(addressPrisma, parsedBody);

      return res.json(address);
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
