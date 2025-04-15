import { ChargeType, Prisma, PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import { generateErrorMessage } from "@/lib/utils";
import { isEmpty } from "lodash-es";
import { thirdPartyAuthMiddleware } from "@/components/middleware/thirdPartyAuthMiddleware";

const createProjectRequestSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  leadName: z.string().min(1),
  serviceTypes: z.array(
    z.object({
      id: z.string().min(1),
      price: z.number().min(1),
      discountAmount: z.number().optional(),
    })
  ),
  files: z
    .array(
      z.object({
        name: z.string().min(1),
        s3Key: z.string().min(1),
      })
    )
    .optional(),
});

export type CreateProjectRequestParams = z.infer<
  typeof createProjectRequestSchema
>;

const createProjectRequest = async (
  retoolPrisma: PrismaClient,
  data: CreateProjectRequestParams
) =>
  await retoolPrisma.$transaction(async (tx) => {
    await tx.project.create({
      data: {
        name: data.name,
        description: data.description,
        leadName: data.leadName,
        projectServicePricing: {
          create: data.serviceTypes.map((service) => ({
            finalPrice: service.price,
            priceAdjustments: service.discountAmount
              ? {
                  create: {
                    type: ChargeType.DISCOUNT,
                    amount: service.discountAmount,
                  },
                }
              : undefined,
            serviceType: {
              connect: {
                id: service.id,
              },
            },
          })),
        },
        files:
          !isEmpty(data.files) && data.files
            ? {
                create: data.files.map((file) => ({
                  fileName: file.name,
                  s3Key: file.s3Key,
                })),
              }
            : undefined,
        organization: {
          connect: {
            id: data.organizationId,
          },
        },
      },
    });
  });

export type CreateProjectRequestResponse = Prisma.PromiseReturnType<
  typeof createProjectRequest
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    CreateProjectRequestResponse | { error: string } | { message: string }
  >
) {
  if (!(await thirdPartyAuthMiddleware(req, res))) return;
  const retool_user = req.headers["x-retool-user"] as string;

  const retoolPrisma = prisma.$extends(
    forUser(undefined, retool_user)
  ) as PrismaClient;

  if (req.method === "POST") {
    const parsedBody = createProjectRequestSchema.parse(req.body);

    try {
      const project = await createProjectRequest(retoolPrisma, parsedBody);

      return res.json(project);
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

      const projects = await retoolPrisma.project.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        select: {
          id: true,
        },
      });

      if (projects.length !== ids.length) {
        return res
          .status(404)
          .json({ error: "One or more selected projects not found" });
      }

      await retoolPrisma.project.updateMany({
        where: {
          id: {
            in: ids,
          },
        },
        data: {
          deleted: true,
        },
      });

      return res.json({ message: "Selected project(s) deleted successfully" });
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
