import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import { generateErrorMessage } from "@/lib/utils";
import { thirdPartyAuthMiddleware } from "@/components/middleware/thirdPartyAuthMiddleware";

const createServiceRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(1),
  labTestId: z.string().min(1),
});

export type CreateServiceRequestParams = z.infer<
  typeof createServiceRequestSchema
>;

const createServiceRequest = async (
  retoolPrisma: PrismaClient,
  data: CreateServiceRequestParams
) =>
  await retoolPrisma.$transaction(async (tx) => {
    await tx.serviceType.create({
      data: {
        name: data.name,
        description: data.description ?? "N/A",
        price: data.price,
        labTestId: data.labTestId,
      },
    });
  });

export type CreateServiceRequestResponse = Prisma.PromiseReturnType<
  typeof createServiceRequest
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    CreateServiceRequestResponse | { error: string } | { message: string }
  >
) {
  if (!(await thirdPartyAuthMiddleware(req, res))) return;
  const retool_user = req.headers["x-retool-user"] as string;

  const retoolPrisma = prisma.$extends(
    forUser(undefined, retool_user)
  ) as PrismaClient;

  if (req.method === "POST") {
    const parsedBody = createServiceRequestSchema.parse(req.body);

    try {
      const service = await createServiceRequest(retoolPrisma, parsedBody);

      return res.json(service);
    } catch (e) {
      console.error({ e });
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

      const services = await retoolPrisma.serviceType.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        select: {
          id: true,
        },
      });

      if (services.length !== ids.length) {
        return res
          .status(404)
          .json({ error: "One or more selected services not found" });
      }

      await retoolPrisma.serviceType.updateMany({
        where: {
          id: {
            in: ids,
          },
        },
        data: {
          deleted: true,
        },
      });

      return res.json({ message: "Selected service(s) deleted successfully" });
    } catch (e) {
      console.error({ e });
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
