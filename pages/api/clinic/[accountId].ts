import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import prisma, { forUser } from "@/lib/prisma";

import assert from "assert";
import { ensureSession } from "@/components/middleware/ensureSession";

const getOrganization = async (
  clinicPrisma: PrismaClient,
  { accountId }: { accountId: string }
) => {
  const account = await clinicPrisma.account.findUnique({
    where: {
      id: accountId,
    },
    select: {
      organization: true,
    },
  });

  if (!account) {
    throw new Error(`Account organization not found`);
  }

  return { ...account.organization };
};

export type GetOrganizationResponse = Prisma.PromiseReturnType<
  typeof getOrganization
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetOrganizationResponse | { error: string }>
) {
  const { account } = await ensureSession(req, res);

  const clinicPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (req.method === "GET") {
    const { accountId } = req.query;
    assert(typeof accountId === "string");

    const clinics = await getOrganization(clinicPrisma, {
      accountId,
    });
    res.json(clinics);
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
