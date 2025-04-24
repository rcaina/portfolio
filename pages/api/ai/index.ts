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
          messages: [{ role: "user", content: message }],
        });

        return res
          .status(200)
          .json({ reply: response.choices[0].message.content });
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ error: "Something went wrong with OpenAI" });
      }
    }

    default:
      return res.status(405).end();
  }
};

export default handler;
