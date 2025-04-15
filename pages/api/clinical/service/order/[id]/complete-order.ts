import {
  ChargeType,
  PriceAdjustment,
  Prisma,
  PrismaClient,
  RequisitionFormStatus,
  Role,
} from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import assert from "assert";
import { ensureSession } from "@/components/middleware/ensureSession";
import { getAccountStatus } from "@/pages/api/current/license-status";
import { isEmpty } from "lodash-es";

const CompleteServiceRequestSchema = z.object({
  subtotal: z.number().min(1),
  priceAdjustments: z
    .array(z.object({ amount: z.number().min(1), type: z.string() }))
    .optional(),
  total: z.number().min(1),
});

export type CompleteServiceRequestParams = z.infer<
  typeof CompleteServiceRequestSchema
>;

const completeServiceRequest = async (
  serviceRequestPrisma: PrismaClient,
  orderId: string,
  data: CompleteServiceRequestParams
) =>
  await serviceRequestPrisma.$transaction(async (tx) => {
    const updatedServiceRequest = await tx.serviceRequest.update({
      where: {
        id: orderId,
      },
      data: {
        order: {
          update: {
            status: "ASSIGNED",
            reqFormStatus: RequisitionFormStatus.PENDING_APPROVAL,
            price: data.total,
            total: data.total,
            priceAdjustments: !isEmpty(data.priceAdjustments)
              ? {
                  create: data.priceAdjustments?.map((charge) => ({
                    amount: charge.amount,
                    type: charge.type as ChargeType,
                  })),
                }
              : undefined,
          },
        },
      },
      select: {
        id: true,
        order: {
          select: {
            status: true,
          },
        },
        serviceType: {
          select: {
            name: true,
            price: true,
          },
        },
        specimen: {
          select: {
            id: true,
            kitId: true,
            status: true,
          },
        },
      },
    });

    await tx.specimen.updateMany({
      where: {
        serviceRequestId: orderId,
      },
      data: {
        status: "ASSIGNED",
      },
    });

    return updatedServiceRequest;
  });

export type UpdateServiceRequestPatientResponse = Prisma.PromiseReturnType<
  typeof completeServiceRequest
>;

const generateErrorMessage = (errors: ZodError) => {
  return errors.errors
    .map((err) => {
      switch (err.path[0]) {
        default:
          return "Invalid data provided.";
      }
    })
    .join(" ");
};

const calculatePriceDetails = async (
  serviceType: { price: number },
  priceAdjustments: PriceAdjustment[]
) => {
  let total = serviceType.price;
  if (priceAdjustments.length > 0) {
    priceAdjustments.forEach((charge) => {
      total += charge.amount;
    });
  }

  return {
    subtotal: serviceType.price,
    priceAdjustments,
    total: total,
  };
};

const allowedRoles: Role[] = [Role.STAFF, Role.PRACTITIONER];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateServiceRequestPatientResponse | { error: string }>
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

  const serviceRequestFound =
    await serviceRequestPrisma.serviceRequest.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        serviceType: {
          select: {
            name: true,
            price: true,
          },
        },
        order: {
          select: {
            status: true,
            priceAdjustments: true,
          },
        },
      },
    });

  if (!serviceRequestFound) {
    return res.status(404).json({ error: "Order to update not found" });
  }

  if (req.method === "PATCH") {
    try {
      const priceDetails = await calculatePriceDetails(
        serviceRequestFound.serviceType,
        serviceRequestFound.order?.priceAdjustments || []
      );

      const parsedPriceDetails =
        CompleteServiceRequestSchema.parse(priceDetails);
      const serviceOrder = await completeServiceRequest(
        serviceRequestPrisma,
        id,
        parsedPriceDetails
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
