import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Role } from "@prisma/client";
import prisma, { forUser } from "@/lib/prisma";

import { ensureSession } from "@/components/middleware/ensureSession";
import { toArray } from "@/lib/utils";

export type GetClinicEmployeeParams = {
  roles?: string[];
  id?: string;
  filters?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
};

const getEmployees = async (
  accountPrisma: PrismaClient,
  { id, roles, search, page, pageSize }: GetClinicEmployeeParams
) => {
  const skip = (page || 0) * (pageSize || 10);
  const take = pageSize || 10;
  const where: Prisma.AccountWhereInput = {
    organizationId: id,
    role: { in: roles ? (roles as Role[]) : undefined },
    OR: search
      ? [
          {
            employee: {
              fullName: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ]
      : undefined,
  };

  const employees = await accountPrisma.account.findMany({
    where,
    skip,
    take,
    include: {
      employee: true,
    },
    orderBy: {
      employee: {
        fullName: "asc",
      },
    },
  });

  const totalEmployees = await accountPrisma.account.count({
    where,
  });

  return { employees, totalEmployees };
};

export type GetClinicEmployeesResponse = Prisma.PromiseReturnType<
  typeof getEmployees
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetClinicEmployeesResponse | { error: string }>
) {
  const { account } = await ensureSession(req, res);

  const accountPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (req.method === "GET") {
    const { filters, search, id }: GetClinicEmployeeParams = req.query;
    const roles = toArray(req.query.roles);
    const pageSize =
      typeof req.query.pageSize === "string"
        ? parseInt(req.query.pageSize)
        : 10;
    const page =
      typeof req.query.page === "string" ? parseInt(req.query.page) : 0;

    const employees = await getEmployees(accountPrisma, {
      filters,
      roles,
      search,
      page,
      pageSize,
      id,
    });
    res.json(employees);
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
