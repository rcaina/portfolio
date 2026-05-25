import { SYSTEM_PROMPT } from "@/lib/utils";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message } = (await req.json()) as { message?: string };

    if (typeof message !== "string" || message.trim() === "") {
      return NextResponse.json({ reply: "Empty message." }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    });

    return NextResponse.json({
      reply: response.choices[0].message.content,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);

    if (error?.response?.status === 429 || error?.message?.includes("quota")) {
      return NextResponse.json(
        {
          reply:
            "Sorry! We've run out of AI credits for now. Please try again later.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { reply: "Something went wrong with OpenAI." },
      { status: 500 }
    );
  }
}
