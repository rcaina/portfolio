import type { NextApiRequest, NextApiResponse } from "next";
import {
  Prisma,
  PrismaClient,
  RequisitionFormStatus,
  TissueType,
} from "@prisma/client";
import { ZodError, z } from "zod";
import { generateErrorMessage, getOrderId } from "@/lib/utils";
import prisma, { forUser } from "@/lib/prisma";

import { thirdPartyAuthMiddleware } from "@/components/middleware/thirdPartyAuthMiddleware";

const createSpecimenRequestSchema = z.object({
  organizationId: z.string().min(1),
  projectId: z.string().min(1),
  serviceTypeId: z.string().min(1),
  notes: z.string().optional(),
  specimen: z.array(
    z.object({
      kitId: z.string().min(1),
      tissueType: z.string().min(1),
      volume: z.number().min(1),
      note: z.string().optional(),
    })
  ),
});

export type CreateSpecimenRequestParams = z.infer<
  typeof createSpecimenRequestSchema
>;

const createSpecimenRequest = async (
  retoolPrisma: PrismaClient,
  data: CreateSpecimenRequestParams
) =>
  await retoolPrisma.$transaction(async (tx) => {
    const serviceType = await tx.project.findUnique({
      where: {
        id: data.projectId,
      },
      select: {
        projectServicePricing: {
          where: {
            serviceTypeId: data.serviceTypeId,
          },
        },
      },
    });

    await tx.order.create({
      data: {
        organizationId: data.organizationId,
        orderId: getOrderId(),
        reqFormStatus: RequisitionFormStatus.APPROVED,
        status: "ORDERED",
        notes: data.notes
          ? {
              create: {
                body: data.notes,
              },
            }
          : undefined,
        serviceRequests: {
          create: data.specimen.map((sample) => ({
            project: {
              connect: {
                id: data.projectId,
              },
            },
            price: serviceType?.projectServicePricing[0].finalPrice,
            serviceType: {
              connect: {
                id: data.serviceTypeId,
              },
            },
            notes: sample?.note
              ? {
                  create: {
                    body: sample?.note,
                  },
                }
              : undefined,
            specimen: {
              create: {
                kitId: sample.kitId,
                tissueType: sample.tissueType as TissueType,
                volume: sample.volume,
                status: "ORDERED",
              },
            },
          })),
        },
      },
    });
  });

export type CreateSpecimenRequestResponse = Prisma.PromiseReturnType<
  typeof createSpecimenRequest
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    CreateSpecimenRequestResponse | { message: string } | { error: string }
  >
) {
  if (!(await thirdPartyAuthMiddleware(req, res))) return;
  const retool_user = req.headers["x-retool-user"] as string;
  const retoolPrisma = prisma.$extends(
    forUser(undefined, retool_user)
  ) as PrismaClient;

  if (req.method === "POST") {
    const parsedBody = createSpecimenRequestSchema.parse(req.body);

    try {
      const project = await createSpecimenRequest(retoolPrisma, parsedBody);

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

      const specimen = await retoolPrisma.serviceRequest.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        select: {
          id: true,
        },
      });

      if (specimen.length !== ids.length) {
        return res
          .status(404)
          .json({ error: "One or more selected specimen not found" });
      }
      //fix
      await retoolPrisma.serviceRequest.updateMany({
        where: {
          id: {
            in: ids,
          },
        },
        data: {
          deleted: true,
        },
      });

      await retoolPrisma.specimen.updateMany({
        where: {
          serviceRequestId: {
            in: ids,
          },
        },
        data: {
          deleted: true,
        },
      });

      return res.json({ message: "Selected specimen deleted successfully" });
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
