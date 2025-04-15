import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, SexType } from "@prisma/client";
import prisma, { forUser } from "@/lib/prisma";

import { ensureSession } from "@/components/middleware/ensureSession";
import { handleError } from "@/lib/utils";

export type GetPatientsParams = {
  practitionerId?: string;
  filters?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
};

export type PostPatientParams = {
  organizationId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  sex: SexType;
  medicalRecordNumber: string;
};

const getPatients = async (
  patientPrisma: PrismaClient,
  {
    practitionerId,
    search,
    page,
    pageSize,
    organizationId,
  }: GetPatientsParams & { organizationId: string }
) => {
  const decodedSearch = search ? decodeURIComponent(search) : undefined;
  const skip = (page || 0) * (pageSize || 10);
  const take = pageSize || 10;

  const where: Prisma.PatientWhereInput = {
    organizationId,
    deleted: false,
    practitionerId,
    OR: decodedSearch
      ? [
          {
            fullName: {
              contains: decodedSearch,
              mode: "insensitive",
            },
          },
        ]
      : undefined,
  };
  const patients = await patientPrisma.patient.findMany({
    where,
    skip,
    take,
    orderBy: {
      fullName: "asc",
    },
  });

  const totalPatients = await patientPrisma.patient.count({
    where,
  });

  return { patients, totalPatients };
};

const createPatient = async (
  patientPrisma: PrismaClient,
  {
    fullName,
    firstName,
    lastName,
    email,
    phoneNumber,
    dateOfBirth,
    sex,
    medicalRecordNumber,
    organizationId,
  }: PostPatientParams
) =>
  await patientPrisma.patient.create({
    data: {
      fullName,
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth: new Date(dateOfBirth),
      sex: sex as SexType,
      medicalRecordNumber,
      organization: {
        connect: {
          id: organizationId,
        },
      },
    },
  });

export type GetPatientsResponse = Prisma.PromiseReturnType<typeof getPatients>;

export type PostPatientsResponse = Prisma.PromiseReturnType<
  typeof createPatient
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    GetPatientsResponse | PostPatientsResponse | { error: string }
  >
) {
  const { account } = await ensureSession(req, res);

  const patientPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (req.method === "GET") {
    const { filters, search, practitionerId }: GetPatientsParams = req.query;

    const pageSize =
      typeof req.query.pageSize === "string"
        ? parseInt(req.query.pageSize)
        : 10;
    const page =
      typeof req.query.page === "string" ? parseInt(req.query.page) : 0;

    const patients = await getPatients(patientPrisma, {
      filters,
      search,
      page,
      pageSize,
      practitionerId,
      organizationId: account.organizationId,
    });
    res.json(patients);
  } else if (req.method === "POST") {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      sex,
      dateOfBirth,
      medicalRecordNumber,
    } = req.body;

    try {
      const createdPatient = await createPatient(patientPrisma, {
        organizationId: account.organizationId,
        medicalRecordNumber,
        fullName: firstName + " " + lastName,
        firstName,
        lastName,
        email,
        dateOfBirth,
        phoneNumber,
        sex,
      });
      return res.json(createdPatient);
    } catch (error) {
      handleError(error, res);
    }
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
