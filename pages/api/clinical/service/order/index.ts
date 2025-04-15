import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import { ZodError, z } from "zod";
import { generateErrorMessage, getOrderId } from "@/lib/utils";
import prisma, { forUser } from "@/lib/prisma";

import { ensureSession } from "@/components/middleware/ensureSession";
import { getAccountStatus } from "@/pages/api/current/license-status";

const createServiceRequestSchema = z.object({
  serviceTypeId: z.string().min(1),
});

export type CreateServiceRequestParams = z.infer<
  typeof createServiceRequestSchema
>;

export type GetServiceRequestParams = {
  organizationId?: string;
  filters?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
};

const getServiceRequests = async (
  serviceRequestPrisma: PrismaClient,
  { organizationId, page, pageSize }: GetServiceRequestParams
) => {
  const skip = (page || 0) * (pageSize || 10);
  const take = pageSize || 10;

  const where: Prisma.ServiceRequestWhereInput = {
    order: {
      organizationId: organizationId,
    },
    deleted: false,
  };

  const services = await serviceRequestPrisma.serviceRequest.findMany({
    where,
    select: {
      id: true,
      createdAt: true,
      practitionerId: true,
      patientId: true,
      serviceTypeId: true,
      questionnaire: true,
      order: {
        select: {
          status: true,
          reqFormStatus: true,
          reqFormS3Key: true,
        },
      },
      serviceType: {
        select: {
          name: true,
        },
      },
      patient: {
        select: {
          fullName: true,
        },
      },
      practitioner: {
        select: {
          fullName: true,
        },
      },
      specimen: true,
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

  const totalServices = await serviceRequestPrisma.serviceRequest.count({
    where,
  });

  return { services, totalServices };
};

const createServiceRequest = async (
  serviceRequestPrisma: PrismaClient,
  organizationId: string,
  data: CreateServiceRequestParams
) =>
  await serviceRequestPrisma.$transaction(async (tx) => {
    const project = await tx.project.findFirst({
      where: {
        organizationId,
      },
    });

    if (!project) {
      throw new Error("No project found for clinic");
    }

    await tx.order.create({
      data: {
        organizationId,
        orderId: getOrderId(),
        serviceRequests: {
          create: {
            project: {
              connect: {
                id: project.id,
              },
            },
            serviceType: {
              connect: {
                id: data.serviceTypeId,
              },
            },
          },
        },
      },
    });
  });

export type GetServiceRequestResponse = Prisma.PromiseReturnType<
  typeof getServiceRequests
>;

export type CreateServiceRequestResponse = Prisma.PromiseReturnType<
  typeof createServiceRequest
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    GetServiceRequestResponse | CreateServiceRequestResponse | { error: string }
  >
) {
  const { account } = await ensureSession(req, res);

  const serviceRequestPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  const clinicAccountIsLocked = await getAccountStatus({
    id: account.organizationId,
  });

  if (clinicAccountIsLocked) {
    return res.status(403).json({
      error:
        "Account currently locked. No practitioner with active license found",
    });
  }

  if (req.method === "GET") {
    const { filters, organizationId }: GetServiceRequestParams = req.query;

    const pageSize =
      typeof req.query.pageSize === "string"
        ? parseInt(req.query.pageSize)
        : 10;
    const page =
      typeof req.query.page === "string" ? parseInt(req.query.page) : 0;

    const serviceRequests = await getServiceRequests(serviceRequestPrisma, {
      filters,
      page,
      pageSize,
      organizationId,
    });

    return res.json(serviceRequests);
  } else if (req.method === "POST") {
    const parsedBody = createServiceRequestSchema.parse(req.body);
    try {
      const testOrder = await createServiceRequest(
        serviceRequestPrisma,
        account.organizationId,
        parsedBody
      );

      return res.json(testOrder);
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
