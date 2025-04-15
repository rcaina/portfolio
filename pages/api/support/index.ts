import type { NextApiRequest, NextApiResponse } from "next";

import { ClientSupportRequestTemplate } from "@/components/email/ClientSupportRequestTemplate";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { sendEmail } from "@/lib/email/utils";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ message: string } | { error: string }>
) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    const { name, email, contactNumber, company, message } = req.body;

    const sendToEmail =
      process.env.NODE_ENV === "production" ? "support@resonantdx.com" : email;

    try {
      await sendEmail({
        toEmail: sendToEmail,
        subject: `Client Support Request –  ${name}`,
        html: ClientSupportRequestTemplate({
          name,
          email,
          contactNumber,
          company,
          message,
        }),
      });

      res.json({ message: "Support request sent successfully" });
    } catch (error) {
      console.error(error);

      res.status(500).json({ error: "Failed to send support request" });
    }
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
};

export default handler;
