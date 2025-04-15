import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import { ZodError, z } from "zod";
import { ensureArray, generateErrorMessage } from "@/lib/utils";
import prisma, { forUser } from "@/lib/prisma";

import { ensureSession } from "@/components/middleware/ensureSession";

export type GetSpecimenParams = {
  filters?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
  orderId?: string;
  projectIds?: string[];
};

export const SpecimenSubmitionFormSchema = z.object({
  kitIds: z.array(z.string().min(1)),
});

const getSpecimens = async (
  specimenPrisma: PrismaClient,
  {
    search,
    page,
    pageSize,
    orderId,
    projectIds,
    organizationId,
  }: GetSpecimenParams & { organizationId: string }
) => {
  const encodedSearch = search ? decodeURIComponent(search) : undefined;
  const skip = (page || 0) * (pageSize || 10);
  const take = pageSize || 10;

  const where: Prisma.SpecimenWhereInput = {
    serviceRequest: {
      orderId: orderId,
      project: {
        id: projectIds ? { in: ensureArray(projectIds) } : undefined,
        organizationId,
      },
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
          {
            status: {
              contains: encodedSearch,
              mode: "insensitive",
            },
          },
          {
            serviceRequest: {
              OR: [
                {
                  order: {
                    orderId: {
                      contains: encodedSearch,
                      mode: "insensitive",
                    },
                  },
                },
                {
                  project: {
                    name: {
                      contains: encodedSearch,
                      mode: "insensitive",
                    },
                  },
                },
              ],
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
      status: true,
      kitId: true,
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

const addNewSpecimen = async (
  specimenPrisma: PrismaClient,
  data: { organizationId: string; kitIds: string[] }
) => {
  return await specimenPrisma.serviceRequest.createMany({
    data: data.kitIds.map((kitId) => ({
      organizationId: data.organizationId,
      serviceTypeId: "specimen",
      kit: {
        create: {
          kitId,
        },
      },
    })),
  });
};

export type PostSpecimenResponse = Prisma.PromiseReturnType<
  typeof addNewSpecimen
>;
export type GetSpecimenResponse = Prisma.PromiseReturnType<typeof getSpecimens>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    GetSpecimenResponse | PostSpecimenResponse | { error: string }
  >
) {
  const { account } = await ensureSession(req, res);

  const specimenPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (req.method === "POST") {
    try {
      const parsedBoday = SpecimenSubmitionFormSchema.parse(req.body);

      const specimens = await addNewSpecimen(specimenPrisma, {
        organizationId: account.organizationId,
        kitIds: parsedBoday.kitIds,
      });

      res.json(specimens);
    } catch (e) {
      if (e instanceof ZodError) {
        const customErrorMessage = generateErrorMessage(e);
        return res.status(400).json({ error: customErrorMessage });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "GET") {
    const { filters, search, orderId, projectIds }: GetSpecimenParams =
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
      orderId,
      projectIds,
      organizationId: account.organizationId,
    });
    res.json(specimens);
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
