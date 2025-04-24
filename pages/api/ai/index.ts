import { SYSTEM_PROMPT } from "@/lib/contants";
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "POST": {
      const { message } = req.body;

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            { role: "user", content: message },
          ],
        });

        return res
          .status(200)
          .json({ reply: response.choices[0].message.content });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(error);

        // Handle quota exceeded error
        if (
          error?.response?.status === 429 ||
          error?.message?.includes("quota")
        ) {
          return res.status(429).json({
            reply:
              "Sorry! We've run out of AI credits for now. Please try again later.",
          });
        }

        return res
          .status(500)
          .json({ reply: "Something went wrong with OpenAI." });
      }
    }

    default:
      return res.status(405).end();
  }
};

export default handler;
