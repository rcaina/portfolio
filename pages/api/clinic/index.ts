import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import assert from "assert";
import { ensureSession } from "@/components/middleware/ensureSession";

const updateClinicSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  billingEmails: z.array(z.string()).optional(),
});

export type GetOrganizationsParams = {
  userId?: string;
  filters?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
};

const getClinics = async (
  clinicPrisma: PrismaClient,
  params: GetOrganizationsParams
) => {
  const clinics = await clinicPrisma.organization.findMany({
    where: {
      accounts: {
        some: {
          employee: {
            id: params.userId,
          },
        },
      },
    },
    include: {
      billingAddresses: true,
      accounts: {
        include: {
          employee: true,
        },
      },
    },
  });

  return clinics;
};

export type UpdateClinicParams = z.infer<typeof updateClinicSchema>;

const updateClinic = async (
  clinicPrisma: PrismaClient,
  { id, name, billingEmails }: UpdateClinicParams
) => {
  const clinic = await clinicPrisma.organization.update({
    where: {
      id: id,
    },
    data: {
      name,
      billingEmails,
    },
  });

  return clinic;
};

export type GetClinicsResponse = Prisma.PromiseReturnType<typeof getClinics>;

export type UpdateClinicResponse = Prisma.PromiseReturnType<
  typeof updateClinic
>;

const generateErrorMessage = (errors: ZodError) => {
  return errors.errors
    .map((err) => {
      switch (err.path[0]) {
        case "id":
          return "The clinic not found.";
        case "name":
          return "The clinic name is required.";
        case "billingEmails":
          return "The billing emails must be an array of strings.";
          break;
        default:
          return err.message;
      }
    })
    .join(", ");
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    UpdateClinicResponse | GetClinicsResponse | { error: string }
  >
) {
  const { account } = await ensureSession(req, res);

  const clinicPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (req.method === "GET") {
    const { userId }: GetOrganizationsParams = req.query;
    assert(typeof userId === "string");

    const pageSize =
      typeof req.query.pageSize === "string"
        ? parseInt(req.query.pageSize)
        : 10;
    const page =
      typeof req.query.page === "string" ? parseInt(req.query.page) : 0;

    const clinics = await getClinics(clinicPrisma, {
      userId,
      page,
      pageSize,
    });
    res.json(clinics);
  } else if (req.method === "PUT") {
    try {
      const parsedBody = updateClinicSchema.parse(req.body);

      const clinic = await updateClinic(clinicPrisma, parsedBody);

      res.json(clinic);
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
