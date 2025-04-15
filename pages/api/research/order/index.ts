import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import prisma, { forUser } from "@/lib/prisma";

import { ensureArray } from "@/lib/utils";
import { ensureSession } from "@/components/middleware/ensureSession";

export type GetResearchOrdersParams = {
  filters?: string[];
  projectIds?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
};

const getOrders = async (
  ordersPrisma: PrismaClient,
  {
    search,
    page,
    pageSize,
    organizationId,
    projectIds,
  }: GetResearchOrdersParams & { organizationId: string }
) => {
  const encodedSearch = search ? decodeURIComponent(search) : undefined;
  const skip = (page || 0) * (pageSize || 10);
  const take = pageSize || 10;

  const where: Prisma.OrderWhereInput = {
    organizationId,
    deleted: false,
    serviceRequests: {
      some: {
        project: {
          id: projectIds ? { in: ensureArray(projectIds) } : undefined,
        },
      },
    },
    OR: encodedSearch
      ? [
          {
            orderId: {
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
            organization: {
              name: {
                contains: encodedSearch,
                mode: "insensitive",
              },
            },
          },
        ]
      : undefined,
  };
  const orders = await ordersPrisma.order.findMany({
    where,
    skip,
    take,
    select: {
      id: true,
      orderId: true,
      status: true,
      submittedToLab: true,
      createdAt: true,
      _count: {
        select: {
          serviceRequests: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const totalOrders = await ordersPrisma.order.count({
    where,
  });

  return { orders, totalOrders };
};

export type GetResearchOrdersResponse = Prisma.PromiseReturnType<
  typeof getOrders
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetResearchOrdersResponse | { error: string }>
) {
  const { account } = await ensureSession(req, res);

  const ordersPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (req.method === "GET") {
    const { filters, search, projectIds }: GetResearchOrdersParams = req.query;

    const pageSize =
      typeof req.query.pageSize === "string"
        ? parseInt(req.query.pageSize)
        : 10;
    const page =
      typeof req.query.page === "string" ? parseInt(req.query.page) : 0;

    const orders = await getOrders(ordersPrisma, {
      filters,
      search,
      projectIds,
      page,
      pageSize,
      organizationId: account.organizationId,
    });
    res.json(orders);
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
