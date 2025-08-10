import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    console.log("OpenRouter AI API called with prompt:", prompt);

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json([{ generated_text: "Please provide a question or prompt." }]);
    }

    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY not found");
      return NextResponse.json([{ generated_text: "AI service is not configured." }]);
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "StudyMate AI Assistant",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.2-3b-instruct:free",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI study assistant. Provide clear, concise, and educational responses to help students with their studies."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      return NextResponse.json([{ generated_text: "Sorry, I'm having trouble connecting to the AI service. Please try again later." }]);
    }

    const data = await response.json();
    console.log("OpenRouter response:", data);

    const generatedText = data.choices?.[0]?.message?.content || "I'm having trouble generating a response right now.";
    
    return NextResponse.json([{ generated_text: generatedText }]);

  } catch (error) {
    console.error("Error in OpenRouter AI API:", error);
    return NextResponse.json([{ generated_text: "I'm experiencing technical difficulties. Please try again in a moment." }]);
  }
}