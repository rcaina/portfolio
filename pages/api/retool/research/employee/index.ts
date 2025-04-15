import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Role } from "@prisma/client";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import ActivateResearchAccountTemplate from "@/components/email/ActivateResearchAccountTemplate";
import { generateErrorMessage } from "@/lib/utils";
import { sendEmail } from "@/lib/email/utils";
import { thirdPartyAuthMiddleware } from "@/components/middleware/thirdPartyAuthMiddleware";

const createEmployeeRequestSchema = z.object({
  organizationId: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().optional(),
  role: z.string().min(1),
  accountOwner: z.boolean(),
});

export type CreateEmployeeRequestParams = z.infer<
  typeof createEmployeeRequestSchema
>;

const createEmployeeRequest = async (
  creditedRetoolUserEmail: string,
  retoolPrisma: PrismaClient,
  data: CreateEmployeeRequestParams
) =>
  await retoolPrisma.$transaction(async (tx) => {
    const employee = await tx.employee.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        phoneNumber: data.phoneNumber,
        email: data.email,
        accounts: {
          create: {
            role: data.role as Role,
            accountOwner: data.accountOwner,
            organization: {
              connect: {
                id: data.organizationId,
              },
            },
          },
        },
      },
      select: {
        email: true,
        fullName: true,
        accounts: {
          where: {
            organizationId: data.organizationId,
          },
          select: {
            organization: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    await sendEmail({
      toEmail: employee.email,
      subject: `Invite to ${employee.accounts[0].organization.name} at Resonant`,
      html: ActivateResearchAccountTemplate({
        name: employee.fullName,
        companyName: employee.accounts[0].organization.name,
      }),
      retoolUserEmail: creditedRetoolUserEmail,
    });

    return employee;
  });

export type CreateEmployeeRequestResponse = Prisma.PromiseReturnType<
  typeof createEmployeeRequest
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    CreateEmployeeRequestResponse | { error: string } | { message: string }
  >
) {
  if (!(await thirdPartyAuthMiddleware(req, res))) return;
  const retool_user_email = req.headers["x-retool-user"] as string;
  const retoolPrisma = prisma.$extends(
    forUser(undefined, retool_user_email)
  ) as PrismaClient;

  if (req.method === "POST") {
    const parsedBody = createEmployeeRequestSchema.parse(req.body);

    if (parsedBody.phoneNumber === "+1") {
      parsedBody.phoneNumber = undefined;
    }

    try {
      const employee = await createEmployeeRequest(
        retool_user_email,
        retoolPrisma,
        parsedBody
      );

      return res.json(employee);
    } catch (e) {
      if (e instanceof ZodError) {
        const customErrorMessage = generateErrorMessage(e);
        return res.status(400).json({ error: customErrorMessage });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    try {
      const { ids } = req.body as { ids: string[] };

      if (ids.length === 0) {
        return res.status(400).json({ error: "No ids provided" });
      }

      const user = await retoolPrisma.employee.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        select: {
          id: true,
        },
      });

      if (user.length !== ids.length) {
        return res
          .status(404)
          .json({ error: "One or more selected employees not found" });
      }

      await retoolPrisma.employee.updateMany({
        where: {
          id: {
            in: ids,
          },
        },
        data: {
          deleted: true,
        },
      });

      return res.json({ message: "Selected employee(s) deleted successfully" });
    } catch (e) {
      if (e instanceof ZodError) {
        const customErrorMessage = generateErrorMessage(e);
        return res.status(400).json({ error: customErrorMessage });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
