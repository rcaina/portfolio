import { NextApiRequest, NextApiResponse } from "next";

import { Prisma } from "@prisma/client";
import assert from "assert";
import { ensureSession } from "@/components/middleware/ensureSession";
import prisma from "@/lib/prisma";

const getSessionUserOrganizations = async ({
  id,
}: { id: string } & {
  id: string;
}) =>
  await prisma.account.findMany({
    where: {
      employeeId: id,
    },
    select: {
      id: true,
    },
  });

export type getSessionUserOrganizationsResponse = Prisma.PromiseReturnType<
  typeof getSessionUserOrganizations
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<getSessionUserOrganizationsResponse | { error: string }>
) {
  await ensureSession(req, res);

  if (req.method === "GET") {
    const { id } = req.query;
    assert(typeof id === "string");

    const sessionUser = await getSessionUserOrganizations({
      id,
    });

    return res.json(sessionUser);
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
