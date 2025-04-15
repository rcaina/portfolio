import { Prisma, PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";
import assert from "assert";
import { ensureSession } from "@/components/middleware/ensureSession";
import { generateErrorMessage } from "@/lib/utils";

const UpdateAddressSchema = z.object({
  currentDefaultId: z.string().min(1),
  isBilling: z.boolean(),
});

export type PostAddressParams = z.infer<typeof UpdateAddressSchema>;

const setAsDefault = async (id: string, data: PostAddressParams) =>
  await prisma.$transaction(async (tx) => {
    const currentDefault = await tx.address.findUnique({
      where: {
        id: data.currentDefaultId,
      },
    });

    if (currentDefault) {
      await tx.address.update({
        where: {
          id: currentDefault.id,
        },
        data: {
          default: false,
        },
      });

      return await tx.address.update({
        where: {
          id,
        },
        data: {
          default: true,
        },
      });
    } else {
      throw new Error("Current default address not found");
    }
  });

export type UpdateAddressResponse = Prisma.PromiseReturnType<
  typeof setAsDefault
>;

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
      const parsedBody = UpdateAddressSchema.parse(req.body);

      const currentDefaultAddress = await addressPrisma.address.findUnique({
        where: {
          id: parsedBody.currentDefaultId,
          default: parsedBody.isBilling,
        },
      });

      if (!parsedBody.isBilling && !currentDefaultAddress) {
        return res.status(404).json({ error: "Shipping address not found" });
      }
      if (parsedBody.isBilling && !currentDefaultAddress) {
        return res.status(404).json({ error: "Billing address not found" });
      }

      const address = await setAsDefault(id, parsedBody);

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
