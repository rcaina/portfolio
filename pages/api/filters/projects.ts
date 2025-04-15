import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError, z } from "zod";

import { Prisma } from "@prisma/client";
import { ensureSession } from "@/components/middleware/ensureSession";
import { generateErrorMessage } from "@/lib/utils";
import prisma from "@/lib/prisma";

const getProjectsSchema = z.object({
  organizationId: z.string().min(1),
});

export type getProjectsParams = z.infer<typeof getProjectsSchema>;

const getProjects = async (data: getProjectsParams) =>
  await prisma.project.findMany({
    where: {
      organization: {
        id: data.organizationId,
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

export type getProjectsResponse = Prisma.PromiseReturnType<typeof getProjects>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    getProjectsResponse | { error: string } | { message: string }
  >
) {
  await ensureSession(req, res);

  if (req.method === "GET") {
    const parsedBody = getProjectsSchema.parse(req.query);

    try {
      const project = await getProjects(parsedBody);

      return res.json(project);
    } catch (e) {
      console.error({ e });
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
