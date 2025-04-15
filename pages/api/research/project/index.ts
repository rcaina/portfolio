import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import prisma, { forUser } from "@/lib/prisma";

import { ensureSession } from "@/components/middleware/ensureSession";

export type GetResearchProjectsParams = {
  filters?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
};

const getProjects = async (
  projectPrisma: PrismaClient,
  {
    search,
    page,
    pageSize,
    organizationId,
  }: GetResearchProjectsParams & { organizationId: string }
) => {
  const encodedSearch = search ? decodeURIComponent(search) : undefined;
  const skip = (page || 0) * (pageSize || 10);
  const take = pageSize || 10;

  const where: Prisma.ProjectWhereInput = {
    organizationId,
    deleted: false,
    OR: encodedSearch
      ? [
          {
            name: {
              contains: encodedSearch,
              mode: "insensitive",
            },
          },
          {
            leadName: {
              contains: encodedSearch,
              mode: "insensitive",
            },
          },
        ]
      : undefined,
  };
  const projects = await projectPrisma.project.findMany({
    where,
    skip,
    take,
    select: {
      id: true,
      name: true,
      leadName: true,
      active: true,
      createdAt: true,
      _count: {
        select: {
          serviceRequests: {
            where: {
              deleted: false,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const totalProjects = await projectPrisma.project.count({
    where,
  });

  return { projects, totalProjects };
};

export type GetResearchProjectsResponse = Prisma.PromiseReturnType<
  typeof getProjects
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetResearchProjectsResponse | { error: string }>
) {
  const { account } = await ensureSession(req, res);

  const projectPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (req.method === "GET") {
    const { filters, search }: GetResearchProjectsParams = req.query;

    const pageSize =
      typeof req.query.pageSize === "string"
        ? parseInt(req.query.pageSize)
        : 10;
    const page =
      typeof req.query.page === "string" ? parseInt(req.query.page) : 0;

    const projects = await getProjects(projectPrisma, {
      filters,
      search,
      page,
      pageSize,
      organizationId: account.organizationId,
    });
    res.json(projects);
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
