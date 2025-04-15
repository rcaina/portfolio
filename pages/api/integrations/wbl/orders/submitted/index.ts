import { NextApiRequest, NextApiResponse } from "next";

import { Prisma } from "@prisma/client";
import { handleError } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { thirdPartyAuthMiddleware } from "@/components/middleware/thirdPartyAuthMiddleware";

const ordersForWasatchBiolabs = async (ids: string[]) => {
  return await prisma.order.findMany({
    where: {
      labOrderId: {
        in: ids,
      },
      status: "CANCELED",
    },
    select: {
      labOrderId: true,
    },
  });
};

export type GetServiceRequestsForWasatchBiolabsResponse =
  Prisma.PromiseReturnType<typeof ordersForWasatchBiolabs>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | GetServiceRequestsForWasatchBiolabsResponse
    | { message: string }
    | { error: string }
  >
) {
  if (!(await thirdPartyAuthMiddleware(req, res))) return;
  if (req.method === "POST") {
    try {
      const { ids } = req.body as { ids: string[] };
      const orders = await ordersForWasatchBiolabs(ids);
      res.json(orders);
    } catch (error: unknown) {
      console.error(error);
      handleError(error, res);
    }
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
