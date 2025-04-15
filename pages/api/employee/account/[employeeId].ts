import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Role } from "@prisma/client";
import prisma, { forUser } from "@/lib/prisma";

import assert from "assert";
import { ensureSession } from "@/components/middleware/ensureSession";

const updateEmployeeOrganizationAccount = async (
  employeePrisma: PrismaClient,
  {
    organizationId,
    role,
    accountOwner,
    employeeId,
  }: {
    organizationId: string;
    employeeId: string;
    role?: Role;
    accountOwner: boolean;
  }
) =>
  await employeePrisma.account.update({
    where: {
      employeeId_organizationId: {
        organizationId,
        employeeId,
      },
    },
    data: {
      role,
      accountOwner,
    },
    select: {
      id: true,
    },
  });

export type UpdateEmployeeOrganizationAccountResponse =
  Prisma.PromiseReturnType<typeof updateEmployeeOrganizationAccount>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    UpdateEmployeeOrganizationAccountResponse | { error: string }
  >
) {
  const { account } = await ensureSession(req, res);

  const employeePrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (req.method === "PATCH") {
    const { employeeId } = req.query;
    assert(typeof employeeId === "string");

    const { role, accountOwner, organizationId } = req.body;

    const organization = await updateEmployeeOrganizationAccount(
      employeePrisma,
      {
        organizationId,
        employeeId,
        role,
        accountOwner,
      }
    );
    res.json(organization);
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
