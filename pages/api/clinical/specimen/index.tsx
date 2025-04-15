import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import prisma, { forUser } from "@/lib/prisma";

import { ensureSession } from "@/components/middleware/ensureSession";

export type GetSpecimenParams = {
  practitionerId?: string;
  patientId?: string;
  filters?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
};

const getSpecimens = async (
  specimenPrisma: PrismaClient,
  {
    search,
    page,
    pageSize,
    organizationId,
    patientId,
  }: GetSpecimenParams & { organizationId: string }
) => {
  const encodedSearch = search ? decodeURIComponent(search) : undefined;
  const skip = (page || 0) * (pageSize || 10);
  const take = pageSize || 10;

  const where: Prisma.SpecimenWhereInput = {
    serviceRequest: {
      order: {
        organizationId,
      },
      patientId,
    },
    deleted: false,
    OR: encodedSearch
      ? [
          {
            kitId: {
              contains: encodedSearch,
              mode: "insensitive",
            },
          },
        ]
      : undefined,
  };
  const specimens = await specimenPrisma.specimen.findMany({
    where,
    skip,
    take,
    select: {
      id: true,
      kitId: true,
      status: true,
      resultS3Key: true,
      createdAt: true,
      serviceRequest: {
        select: {
          order: {
            select: {
              orderId: true,
            },
          },
          project: {
            select: {
              name: true,
            },
          },
          serviceType: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const totalSpecimens = await specimenPrisma.specimen.count({
    where,
  });

  return { specimens, totalSpecimens };
};

export type GetSpecimenResponse = Prisma.PromiseReturnType<typeof getSpecimens>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetSpecimenResponse | { error: string }>
) {
  const { account } = await ensureSession(req, res);

  const specimenPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (req.method === "GET") {
    const { filters, search, practitionerId, patientId }: GetSpecimenParams =
      req.query;

    const pageSize =
      typeof req.query.pageSize === "string"
        ? parseInt(req.query.pageSize)
        : 10;
    const page =
      typeof req.query.page === "string" ? parseInt(req.query.page) : 0;

    const specimens = await getSpecimens(specimenPrisma, {
      filters,
      search,
      page,
      pageSize,
      practitionerId,
      patientId,
      organizationId: account.organizationId,
    });
    res.json(specimens);
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
