import { LicenseStatus, Prisma, Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import { ensureSession } from "@/components/middleware/ensureSession";
import prisma from "@/lib/prisma";

export const getAccountStatus = async ({ id }: { id: string }) => {
  const practitioners = await prisma.employee.findMany({
    where: {
      accounts: {
        some: {
          organizationId: id,
          role: Role.PRACTITIONER,
        },
      },
      licenses: {
        some: {
          expirationDate: {
            gt: new Date(),
          },
          status: LicenseStatus.ACTIVE,
        },
      },
    },
  });

  return practitioners.length === 0;
};

export type GetAccountStatusResponse = Prisma.PromiseReturnType<
  typeof getAccountStatus
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetAccountStatusResponse | { error: string }>
) {
  const { account } = await ensureSession(req, res);

  if (req.method === "GET") {
    const locked = await getAccountStatus({ id: account.organizationId });

    res.json(locked);
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
