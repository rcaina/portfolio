import { NextApiRequest, NextApiResponse } from "next";

import assert from "assert";
import prisma from "@/lib/prisma";

assert(
  process.env.INTEGRATION_RESONANT_REQUEST_TOKEN,
  "Authentication token is not configured"
);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  assert(typeof id === "string", "id is required");

  const specimen = await prisma.specimen.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      kitId: true,
      status: true,
    },
  });

  if (!specimen) {
    return res.status(404).json({ message: "Specimen not found" });
  }

  if (specimen.status !== "COMPLETED") {
    return res
      .status(404)
      .json({ message: "Specimen has not yet been completed" });
  }

  try {
    switch (req.method) {
      case "GET":
        const response = await fetch(
          `${process.env.INTEGRATION_WBL_URL}/samples/results/${specimen.kitId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.INTEGRATION_RESONANT_REQUEST_TOKEN}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Error response:", errorData);
          throw new Error(
            `Failed to fetch data: ${response.status} ${response.statusText} - ${errorData}`
          );
        }

        // Parse the response data
        const data = await response.json();
        // Return the actual data from the third party
        return res.status(200).json(data);
      default:
        return res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default handler;
