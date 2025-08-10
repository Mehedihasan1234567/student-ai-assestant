import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question, context } = await req.json();

    if (!question || !context) {
      return NextResponse.json({ error: "Missing question or context" }, { status: 400 });
    }

    const response = await fetch("https://api-inference.huggingface.co/models/deepset/roberta-base-squad2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: { question, context } }),
    });

    const data = await response.json();

    return NextResponse.json({ answer: data.answer || "No answer found" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get AI answer" }, { status: 500 });
  }
}
