import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import prisma, { forUser } from "@/lib/prisma";

import assert from "assert";
import { ensureSession } from "@/components/middleware/ensureSession";

export type GetPatientServiceParams = {
  patientId?: string;
  filters?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
};

const getPatientServices = async (
  patientPrisma: PrismaClient,
  { patientId, search, page, pageSize }: GetPatientServiceParams
) => {
  const skip = (page || 0) * (pageSize || 10);
  const take = pageSize || 10;

  const where: Prisma.SpecimenWhereInput = {
    serviceRequest: {
      patientId: patientId,
    },

    OR: search
      ? [
          {
            status: {
              contains: search,
              mode: "insensitive",
            },
            serviceRequest: {
              serviceType: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              patient: {
                fullName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          },
        ]
      : undefined,
  };
  const services = await patientPrisma.specimen.findMany({
    where,
    include: {
      serviceRequest: {
        include: {
          serviceType: true,
          patient: true,
        },
      },
    },
    skip,
    take,
  });

  const totalServices = await patientPrisma.specimen.count({
    where,
  });

  return { services, totalServices };
};

export type GetPatientServiceResponse = Prisma.PromiseReturnType<
  typeof getPatientServices
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetPatientServiceResponse | { error: string }>
) {
  const { account } = await ensureSession(req, res);

  const patientPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  const { id } = req.query;
  assert(typeof id === "string");

  const patient = await patientPrisma.patient.findUnique({
    where: {
      id,
    },
    select: {
      organizationId: true,
    },
  });

  if (!patient) {
    return res.status(404).json({
      error: "Patient not found.",
    });
  }

  if (account.organizationId !== patient.organizationId) {
    return res.status(403).json({
      error: "You do not have permission to access this patient's services.",
    });
  }

  if (req.method === "GET") {
    const { filters, search }: GetPatientServiceParams = req.query;
    const pageSize =
      typeof req.query.pageSize === "string"
        ? parseInt(req.query.pageSize)
        : 10;
    const page =
      typeof req.query.page === "string" ? parseInt(req.query.page) : 0;

    const services = await getPatientServices(patientPrisma, {
      filters,
      search,
      page,
      pageSize,
      patientId: id,
    });
    res.json(services);
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
