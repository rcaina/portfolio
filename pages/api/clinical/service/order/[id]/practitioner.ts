import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Role } from "@prisma/client";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import assert from "assert";
import { ensureSession } from "@/components/middleware/ensureSession";
import { getAccountStatus } from "@/pages/api/current/license-status";

const updateServiceRequestPractitionerSchema = z.object({
  practitionerId: z.string().min(1),
});

export type UpdateServiceRequestPractitionerParams = z.infer<
  typeof updateServiceRequestPractitionerSchema
>;

const updateServiceRequestPractitioner = async (
  serviceRequestPrisma: PrismaClient,
  orderId: string,
  data: UpdateServiceRequestPractitionerParams
) =>
  await serviceRequestPrisma.serviceRequest.update({
    where: {
      id: orderId,
    },
    data: {
      practitioner: {
        connect: {
          id: data.practitionerId,
        },
      },
    },
  });

export type UpdateServiceRequestPractitionerResponse = Prisma.PromiseReturnType<
  typeof updateServiceRequestPractitioner
>;

const generateErrorMessage = (errors: ZodError) => {
  return errors.errors
    .map((err) => {
      switch (err.path[0]) {
        case "practitionerId":
          return "Practitioner ID is required.";
        default:
          return "Invalid data provided.";
      }
    })
    .join(" ");
};

const allowedRoles: Role[] = [Role.STAFF, Role.PRACTITIONER];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    UpdateServiceRequestPractitionerResponse | { error: string }
  >
) {
  const { account } = await ensureSession(req, res);

  const serviceRequestPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (!allowedRoles.includes(account.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const organizationAccountIsLocked = await getAccountStatus({
    id: account.organizationId,
  });

  if (organizationAccountIsLocked) {
    return res.status(403).json({
      error:
        "Account currently locked. No practitioner with active license found",
    });
  }

  const { id } = req.query;
  assert(typeof id === "string");

  const parsedBody = updateServiceRequestPractitionerSchema.parse(req.body);

  const serviceRequestFound =
    await serviceRequestPrisma.serviceRequest.findUnique({
      where: {
        id: id,
      },
    });

  if (!serviceRequestFound) {
    return res.status(404).json({ error: "Order to update not found" });
  }

  const practitioner = await serviceRequestPrisma.employee.findUnique({
    where: {
      id: parsedBody.practitionerId,
    },
    select: {
      id: true,
    },
  });

  if (!practitioner) {
    return res.status(404).json({ error: "Practitioner not found" });
  }

  if (req.method === "PUT") {
    try {
      const serviceOrder = await updateServiceRequestPractitioner(
        serviceRequestPrisma,
        id,
        parsedBody
      );

      return res.json(serviceOrder);
    } catch (e) {
      if (e instanceof ZodError) {
        const customErrorMessage = generateErrorMessage(e);
        return res.status(400).json({ error: customErrorMessage });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route`,
    });
  }
}
