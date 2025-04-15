import type { NextApiRequest, NextApiResponse } from "next";

import { Prisma } from "@prisma/client";
import { isEmpty } from "lodash-es";
import prisma from "@/lib/prisma";

type UpdateServicesStatusesParams = {
  julianId: string;
  requisitionNumber: string;
  status: string;
  patientMrn: string;
  completedAt: string;
  createdAt: Date;
};

const updateServicesSpecimens = async (
  data: UpdateServicesStatusesParams[]
) => {
  await Promise.all(
    data.map(async (sample) => {
      return await prisma.specimen.update({
        where: {
          kitId: sample.requisitionNumber,
        },
        data: {
          status: sample.status ? sample.status : undefined,
          serviceRequest: {
            update: {
              order: {
                update: {
                  status: sample.status ? sample.status : undefined,
                },
              },
            },
          },
        },
        select: {
          kitId: true,
          status: true,
        },
      });
    })
  );
};

export type UpdateServiceSpecimensResponse = Prisma.PromiseReturnType<
  typeof updateServicesSpecimens
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    UpdateServiceSpecimensResponse | { message: string } | { error: string }
  >
) {
  const hasValidCronKey =
    req.headers["github-api-key"] === process.env.CRON_API_KEY;
  const hasValidRetoolAuth =
    req.headers["authorization"]?.split(" ")[1] === process.env.RETOOL_AUTH;

  if (!hasValidCronKey && !hasValidRetoolAuth) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    const serviceRequests = await prisma.serviceRequest.findMany({
      where: {
        order: {
          submittedToLab: true,
        },
        specimen: {
          some: {
            NOT: {
              status: "COMPLETED",
              result: null,
            },
          },
        },
      },
      select: {
        specimen: {
          select: {
            kitId: true,
          },
        },
      },
    });

    const ids = serviceRequests
      .map((serviceRequest) => serviceRequest.specimen[0]?.kitId)
      .join(",");

    if (!ids || isEmpty(ids)) {
      return res.status(200).json({ message: "No specimens to update" });
    }

    try {
      const response = await fetch(
        `${process.env.INTEGRATION_WBL_URL}/samples`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.INTEGRATION_RESONANT_REQUEST_TOKEN}`,
          },
          body: JSON.stringify({ ids }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.length > 0) {
        const updatedData = await updateServicesSpecimens(data);
        return res.json(updatedData);
      }
      return res.json({ message: "No services to update" });
    } catch (error) {
      console.error("Error retrieving samples from WBL:", error);
      return false;
    }
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
