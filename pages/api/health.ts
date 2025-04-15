import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ status: string; timestamp: string }>
) {
  res
    .status(200)
    .json({ status: "Healthy", timestamp: new Date().toISOString() });
}
