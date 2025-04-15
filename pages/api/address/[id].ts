import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import assert from "assert";
import { ensureSession } from "@/components/middleware/ensureSession";
import { isEmpty } from "lodash-es";

const updateAddressSchema = z.object({
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

export type PostAddressParams = z.infer<typeof updateAddressSchema>;

const updateAddress = async (id: string, data: PostAddressParams) =>
  await prisma.$transaction(async (tx) => {
    try {
      await tx.address.update({
        where: {
          id,
        },
        data: {
          deleted: true,
        },
      });

      const address = await tx.address.create({
        data: {
          label: data.label,
          addressLine1: data.addressLine1,
          addressLine2: data?.addressLine2,
          city: data.city,
          state: data.state,
          zip: data.zip,
          country: data.country,
          default: data.isDefault,
        },
      });

      await tx.organization.update({
        where: {
          id: data.organizationId,
        },
        data: data.isBilling
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

export type UpdateAddressResponse = Prisma.PromiseReturnType<
  typeof updateAddress
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
        case "label":
          return "Label is required.";
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
  res: NextApiResponse<UpdateAddressResponse | { error: string }>
) {
  const { account } = await ensureSession(req, res);

  const addressPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (req.method === "PUT") {
    try {
      const { id } = req.query;
      assert(typeof id === "string");
      const parsedBody = updateAddressSchema.parse(req.body);

      const clinic = await addressPrisma.organization.findUnique({
        where: {
          id: parsedBody.organizationId,
        },
        select: {
          addresses: {
            where: {
              id,
            },
          },
          billingAddresses: {
            where: {
              id,
            },
          },
        },
      });

      if (parsedBody.isBilling && (!clinic || isEmpty(clinic.addresses))) {
        return res.status(404).json({ error: "Shipping address not found" });
      }
      if (
        !parsedBody.isBilling &&
        (!clinic || isEmpty(clinic.billingAddresses))
      ) {
        return res.status(404).json({ error: "Billing address not found" });
      }

      const address = await updateAddress(id, parsedBody);

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
