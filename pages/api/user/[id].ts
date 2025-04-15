import { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import prisma, { forUser } from "@/lib/prisma";

import assert from "assert";
import { ensureSession } from "@/components/middleware/ensureSession";

const getEmployee = async (
  userPrisma: PrismaClient,
  {
    id,
  }: { id: string } & {
    id: string;
  }
) => {
  const employees = await userPrisma.employee.findUnique({
    where: {
      id,
      deleted: false,
    },
  });

  const totalEmplyees = await userPrisma.employee.count({
    where: {
      deleted: false,
    },
  });

  return {
    employees,
    totalEmplyees,
  };
};
export type GetEmployeeResponse = Prisma.PromiseReturnType<typeof getEmployee>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetEmployeeResponse | { error: string }>
) {
  const { account } = await ensureSession(req, res);

  const userPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (req.method === "GET") {
    const { id } = req.query;
    assert(typeof id === "string");
    const result = await getEmployee(userPrisma, {
      id,
    });
    return res.json(result);
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
