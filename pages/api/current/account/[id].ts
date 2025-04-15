import type { NextApiRequest, NextApiResponse } from "next";

import { Prisma } from "@prisma/client";
import assert from "assert";
import { ensureSession } from "@/components/middleware/ensureSession";
import prisma from "@/lib/prisma";

const getAccount = async ({ id }: { id: string }) => {
  const account = await prisma.account.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      role: true,
      accountOwner: true,
      organization: {
        select: {
          id: true,
          name: true,
          type: true,
          billingEmails: true,
          addresses: {
            where: {
              deleted: false,
            },
            orderBy: {
              addressLine1: "asc",
            },
          },
          billingAddresses: {
            where: {
              deleted: false,
            },
            orderBy: {
              addressLine1: "asc",
            },
          },
        },
      },
    },
  });

  if (!account) {
    throw new Error(`Account not found`);
  }

  return account;
};

export type GetAccountResponse = Prisma.PromiseReturnType<typeof getAccount>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetAccountResponse | { error: string }>
) {
  await ensureSession(req, res);

  if (req.method === "GET") {
    const { id } = req.query;
    assert(typeof id === "string");

    const account = await getAccount({
      id,
    });

    res.json(account);
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
