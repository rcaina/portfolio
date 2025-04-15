import { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient } from "@prisma/client";
import { forUser } from "@/lib/prisma";
import prisma from "@/lib/prisma";
import { thirdPartyAuthMiddleware } from "@/components/middleware/thirdPartyAuthMiddleware";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!(await thirdPartyAuthMiddleware(req, res))) return;

  const retool_user = req.headers["x-retool-user"] as string;
  const retoolPrisma = prisma.$extends(
    forUser(undefined, retool_user)
  ) as PrismaClient;

  try {
    switch (req.method) {
      case "PATCH":
        const { ids } = req.body as { ids: string[] };

        if (ids.length === 0) {
          return res.status(400).json({ error: "No ids provided" });
        }

        const employees = await retoolPrisma.employee.findMany({
          where: {
            id: {
              in: ids,
            },
          },
        });

        if (employees.length !== ids.length) {
          return res
            .status(404)
            .json({ error: "One or more employees not found" });
        }

        await retoolPrisma.employee.updateMany({
          where: { id: { in: ids } },
          data: { deleted: false },
        });

        return res.status(200).json({ message: "Employees activated" });
      default:
        return res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export default handler;
