import { NextResponse } from "next/server";
import { askAI } from "@/lib/ai";

export async function POST(req: Request) {
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  const answer = await askAI(text);
  return NextResponse.json({ answer });
}
