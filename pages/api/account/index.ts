import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import prisma, { forUser } from "@/lib/prisma";

import { ensureSession } from "@/components/middleware/ensureSession";

const getAccounts = async (
  accountPrisma: PrismaClient,
  { id }: { id: string }
) => {
  const accounts = await accountPrisma.account.findMany({
    where: {
      employeeId: id,
    },
    select: {
      id: true,
      organization: true,
    },
  });

  return accounts;
};

export type GetAccountsResponse = Prisma.PromiseReturnType<typeof getAccounts>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetAccountsResponse | { error: string }>
) {
  const { account } = await ensureSession(req, res);

  const accountPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (req.method === "GET") {
    const accounts = await getAccounts(accountPrisma, {
      id: account.employeeId,
    });

    res.json(accounts);
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
