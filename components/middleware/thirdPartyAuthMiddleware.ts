import { NextApiRequest, NextApiResponse } from "next";

const allowedTokens = [
  process.env.INTEGRATION_WBL_VALIDATION_TOKEN,
  process.env.RETOOL_AUTH,
];

export async function thirdPartyAuthMiddleware(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<boolean> {
  const authHeader = req.headers.authorization || "";

  switch (true) {
    case !authHeader.startsWith("Bearer "):
      res.status(401).json({
        error: "Unauthorized: No valid authorization header provided.",
      });
      return false;

    case !authHeader.split(" ")[1]:
      res.status(401).json({
        error: "Unauthorized: Token not found in authorization header.",
      });
      return false;

    case !allowedTokens.includes(authHeader.split(" ")[1]):
      res.status(401).json({
        error: "Unauthorized: Invalid token.",
      });
      return false;

    default:
      return true;
  }
}
