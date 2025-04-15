import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Role } from "@prisma/client";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import assert from "assert";
import { ensureSession } from "@/components/middleware/ensureSession";
import { getAccountStatus } from "@/pages/api/current/license-status";

const updateServiceRequestKitSchema = z.object({
  kitId: z.string().min(1),
});

export type UpdateServiceRequestKitParams = z.infer<
  typeof updateServiceRequestKitSchema
>;

const updateServiceRequestKit = async (
  serviceRequestPrisma: PrismaClient,
  orderId: string,
  data: UpdateServiceRequestKitParams
) => {
  return await serviceRequestPrisma.specimen.create({
    data: {
      kitId: data.kitId,
      serviceRequest: {
        connect: {
          id: orderId,
        },
      },
    },
  });
};

export type UpdateServiceRequestKitResponse = Prisma.PromiseReturnType<
  typeof updateServiceRequestKit
>;

const generateErrorMessage = (errors: ZodError) => {
  return errors.errors
    .map((err) => {
      switch (err.path[0]) {
        case "kitId":
          return err.message;
        default:
          return "Invalid data provided.";
      }
    })
    .join(" ");
};

const removePreviousSpecimen = async (serviceRequestId: string) => {
  await prisma.specimen.deleteMany({
    where: {
      serviceRequestId,
    },
  });
};

const allowedRoles: Role[] = [Role.STAFF, Role.PRACTITIONER];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateServiceRequestKitResponse | { error: string }>
) {
  const { account } = await ensureSession(req, res);

  const serviceRequestPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (!allowedRoles.includes(account.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const organizationAccountIsLocked = await getAccountStatus({
    id: account.organizationId,
  });

  if (organizationAccountIsLocked) {
    return res.status(403).json({
      error:
        "Account currently locked. No practitioner with active license found",
    });
  }

  const { id } = req.query;
  assert(typeof id === "string");

  if (req.method === "PUT") {
    try {
      const parsedBody = updateServiceRequestKitSchema.parse(req.body);

      const serviceRequestFound =
        await serviceRequestPrisma.serviceRequest.findUnique({
          where: { id },
          include: { specimen: true },
        });

      const specimenFound = await serviceRequestPrisma.specimen.findFirst({
        where: {
          kitId: parsedBody.kitId,
        },
      });

      if (specimenFound) {
        return res.status(400).json({
          error: "Kit ID has already been used",
        });
      }

      if (!serviceRequestFound) {
        return res
          .status(404)
          .json({ error: "Service Request to update not found" });
      }
      if (serviceRequestFound.specimen) {
        await removePreviousSpecimen(serviceRequestFound.id);
      }

      const serviceOrder = await updateServiceRequestKit(
        serviceRequestPrisma,
        id,
        parsedBody
      );
      return res.json(serviceOrder);
    } catch (e) {
      if (e instanceof ZodError) {
        const customErrorMessage = generateErrorMessage(e);
        return res.status(400).json({ error: customErrorMessage });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route`,
    });
  }
}
