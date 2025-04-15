import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Role } from "@prisma/client";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import assert from "assert";
import { ensureSession } from "@/components/middleware/ensureSession";
import { getAccountStatus } from "@/pages/api/current/license-status";

const updateServiceRequestPatientSchema = z.object({
  patientId: z.string().min(1),
});

export type UpdateServiceRequestPatientParams = z.infer<
  typeof updateServiceRequestPatientSchema
>;

const updateServiceRequestPatient = async (
  serviceRequestPrisma: PrismaClient,
  orderId: string,
  data: UpdateServiceRequestPatientParams
) =>
  await serviceRequestPrisma.serviceRequest.update({
    where: {
      id: orderId,
    },
    data: {
      patient: {
        connect: {
          id: data.patientId,
        },
      },
    },
  });

export type UpdateServiceRequestPatientResponse = Prisma.PromiseReturnType<
  typeof updateServiceRequestPatient
>;

const generateErrorMessage = (errors: ZodError) => {
  return errors.errors
    .map((err) => {
      switch (err.path[0]) {
        case "patientId":
          return "Patient ID is required.";
        default:
          return "Invalid data provided.";
      }
    })
    .join(" ");
};

const allowedRoles: Role[] = [Role.STAFF, Role.PRACTITIONER];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateServiceRequestPatientResponse | { error: string }>
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

  const parsedBody = updateServiceRequestPatientSchema.parse(req.body);

  const serviceRequestFound =
    await serviceRequestPrisma.serviceRequest.findUnique({
      where: {
        id: id,
      },
    });

  if (!serviceRequestFound) {
    return res.status(404).json({ error: "Order to update not found" });
  }

  const patient = await serviceRequestPrisma.patient.findUnique({
    where: {
      id: parsedBody.patientId,
    },
    select: {
      id: true,
    },
  });

  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }

  if (req.method === "PUT") {
    try {
      const serviceOrder = await updateServiceRequestPatient(
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
