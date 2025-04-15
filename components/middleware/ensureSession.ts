import { Account, Employee, Organization } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export async function ensureSession(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{
  account: Account & {
    employee: Employee;
    organization: Organization;
  };
}> {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res
      .status(400)
      .json({ error: "Bad Request: No active session found, please sign-in" });
    throw new Error("No active session found, please sign-in");
  }

  const account = await prisma.account.findUnique({
    where: {
      id: session.user.currentAccountId || "",
    },
    include: {
      employee: true,
      organization: true,
    },
  });

  if (!account) {
    res.status(404).json({ error: "Not Found: No account found" });
    throw new Error("No account found");
  }

  const user = await prisma.employee.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      email: true,
      accounts: {
        where: {
          organizationId: account.organization.id,
        },
        select: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    res.status(404).json({ error: "Not Found: No user found" });
    throw new Error("No user found");
  }

  if (!user.email) {
    res.status(401).json({ error: "Unauthorized: No email found in session" });
    throw new Error("No email found in session");
  }

  if (!user.accounts[0]) {
    res.status(401).json({ error: "Unauthorized: No role found" });
    throw new Error("No role found in session");
  }

  return { account };
}
