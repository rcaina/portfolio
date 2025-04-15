import { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import prisma, { forUser } from "@/lib/prisma";

import assert from "assert";
import { ensureSession } from "@/components/middleware/ensureSession";

export type UpdatePatientParams = Prisma.PatientUpdateInput;

const updatePatient = async (
  patientPrisma: PrismaClient,
  {
    id,
    fullName,
    firstName,
    lastName,
    email,
    phoneNumber,
    dateOfBirth,
    sex,
  }: UpdatePatientParams & {
    id: string;
    dateOfBirth: string;
  }
) =>
  await patientPrisma.patient.update({
    where: {
      id,
    },
    data: {
      fullName,
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth: new Date(dateOfBirth),
      sex,
    },
  });

export type UpdatePatientResponse = Prisma.PromiseReturnType<
  typeof updatePatient
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdatePatientResponse | { error: string }>
) {
  const { account } = await ensureSession(req, res);

  const patientPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  const { id } = req.query;
  assert(typeof id === "string");

  const patient = await patientPrisma.patient.findUnique({
    where: {
      id,
    },
    select: {
      organizationId: true,
    },
  });

  if (!patient) {
    return res.status(404).json({
      error: "Patient not found.",
    });
  }

  if (account.organizationId !== patient.organizationId) {
    return res.status(403).json({
      error: "You do not have permission to access this patient's services.",
    });
  }

  if (req.method === "PATCH") {
    const { firstName, lastName, email, phoneNumber, sex, dateOfBirth } =
      req.body;

    const result = await updatePatient(patientPrisma, {
      id,
      fullName: firstName + " " + lastName,
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      sex,
    });

    res.json(result);
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
