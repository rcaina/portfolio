import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Role } from "@prisma/client";
import prisma, { forUser } from "@/lib/prisma";

import { ensureSession } from "@/components/middleware/ensureSession";
import { toArray } from "@/lib/utils";

export type GetEmployeesParams = {
  roles?: string[];
  organizationId?: string;
  filters?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
};

const getEmployees = async (
  employeePrisma: PrismaClient,
  { organizationId, roles, search, page, pageSize }: GetEmployeesParams
) => {
  const decodedSearch = search ? decodeURIComponent(search) : undefined;
  const skip = (page || 0) * (pageSize || 10);
  const take = pageSize || 10;
  const where: Prisma.EmployeeWhereInput = {
    accounts: {
      some: {
        organizationId: organizationId,
        role: { in: roles ? (roles as Role[]) : undefined },
      },
    },
    OR: decodedSearch
      ? [
          {
            fullName: {
              contains: decodedSearch,
              mode: "insensitive",
            },
          },
        ]
      : undefined,
  };

  const employees = await employeePrisma.employee.findMany({
    where,
    skip,
    take,
    select: {
      id: true,
      fullName: true,
      licenses: {
        select: {
          status: true,
          createdAt: true,
        },
      },
      accounts: {
        where: {
          organizationId,
        },
        select: {
          role: true,
          accountOwner: true,
        },
      },
    },
    orderBy: {
      fullName: "asc",
    },
  });

  const totalEmployees = await prisma.employee.count({
    where,
  });

  return { employees, totalEmployees };
};

export type GetEmployeesResponse = Prisma.PromiseReturnType<
  typeof getEmployees
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetEmployeesResponse | { error: string }>
) {
  const { account } = await ensureSession(req, res);

  const employeePrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (req.method === "GET") {
    const { filters, search, organizationId }: GetEmployeesParams = req.query;
    const roles = toArray(req.query.roles);
    const pageSize =
      typeof req.query.pageSize === "string"
        ? parseInt(req.query.pageSize)
        : 10;
    const page =
      typeof req.query.page === "string" ? parseInt(req.query.page) : 0;

    const employees = await getEmployees(employeePrisma, {
      filters,
      roles,
      search,
      page,
      pageSize,
      organizationId,
    });
    res.json(employees);
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
