import { NextApiRequest, NextApiResponse } from "next";

import { Prisma } from "@prisma/client";
import { handleError } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { thirdPartyAuthMiddleware } from "@/components/middleware/thirdPartyAuthMiddleware";

type WasatchBiolabsOrder = {
  resonantOrderIds: string[];
  wblOrderIds: string[];
};

const ordersForWasatchBiolabs = async () => {
  return await prisma.order.findMany({
    where: {
      submittedToLab: false,
      deleted: false,
    },
    select: {
      id: true,
      reqFormStatus: true,
      serviceRequests: {
        select: {
          specimen: {
            where: {
              status: {
                in: ["ORDERED"],
              },
              deleted: false,
            },
            select: {
              kitId: true,
            },
          },
        },
      },
    },
  });
};

export type GetServiceRequestsForWasatchBiolabsResponse =
  Prisma.PromiseReturnType<typeof ordersForWasatchBiolabs>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | GetServiceRequestsForWasatchBiolabsResponse
    | { message: string; errors: unknown[] | undefined }
    | { error: string }
  >
) {
  if (!(await thirdPartyAuthMiddleware(req, res))) return;

  if (req.method === "GET") {
    try {
      const orders = await prisma.order.findMany({
        where: {
          submittedToLab: false,
          deleted: false,
        },
        select: {
          id: true,
          reqFormStatus: true,
          serviceRequests: {
            select: {
              serviceType: {
                select: {
                  labTestId: true,
                  name: true,
                },
              },
              specimen: {
                where: { deleted: false },
                select: {
                  kitId: true,
                  tissueType: true,
                  volume: true,
                },
              },
            },
          },
        },
      });

      res.json(orders);
    } catch (error: unknown) {
      handleError(error, res);
    }
  } else if (req.method === "PATCH") {
    try {
      const wblOrders: WasatchBiolabsOrder = req.body;

      const results = await Promise.allSettled(
        wblOrders.resonantOrderIds.map((resonantOrderId, index) =>
          prisma.order.update({
            where: {
              id: resonantOrderId,
            },
            data: {
              submittedToLab: true,
              labOrderId: wblOrders.wblOrderIds[index],
            },
          })
        )
      );

      const errors = results.filter((result) => result.status === "rejected");
      if (errors.length > 0) {
        console.error("Partial failures in updates:", errors);
      }

      res.status(200).json({
        message: "Orders updated successfully.",
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error: unknown) {
      handleError(error, res);
    }
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
