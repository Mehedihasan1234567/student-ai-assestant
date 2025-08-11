import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    console.log("AI API called with prompt:", prompt);

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json([
        { generated_text: "Please provide a question or prompt." },
      ]);
    }

    // Check if API key exists
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.error("HUGGINGFACE_API_KEY not found");
      return NextResponse.json([
        {
          generated_text:
            "AI service is not configured. Please check the API key.",
        },
      ]);
    }

    console.log("Making request to Hugging Face API...");
    const response = await fetch(
      "https://api-inference.huggingface.co/models/openai/gpt-oss-120b",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 200,
            temperature: 0.7,
            do_sample: true,
            pad_token_id: 50256,
          },
        }),
      }
    );

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API error:", response.status, errorText);

      if (response.status === 503) {
        return NextResponse.json([
          {
            generated_text:
              "The AI model is currently loading. Please try again in a few moments.",
          },
        ]);
      }

      return NextResponse.json([
        {
          generated_text:
            "Sorry, I'm having trouble connecting to the AI service. Please try again later.",
        },
      ]);
    }

    const data = await response.json();
    console.log("Hugging Face response:", data);

    // Handle different response formats
    if (Array.isArray(data) && data.length > 0) {
      if (data[0].generated_text) {
        // Clean up the response by removing the original prompt if it's included
        let generatedText = data[0].generated_text;
        if (generatedText.startsWith(prompt)) {
          generatedText = generatedText.substring(prompt.length).trim();
        }
        return NextResponse.json([
          {
            generated_text:
              generatedText ||
              "I understand your question, but I need more context to provide a helpful answer.",
          },
        ]);
      }
    }

    // Fallback response
    return NextResponse.json([
      {
        generated_text:
          "I received your message, but I'm having trouble generating a response right now. Could you try rephrasing your question?",
      },
    ]);
  } catch (error) {
    console.error("Error in AI API:", error);
    return NextResponse.json([
      {
        generated_text:
          "I'm experiencing technical difficulties. Please try again in a moment.",
      },
    ]);
  }
}
