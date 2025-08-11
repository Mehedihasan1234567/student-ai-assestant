import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, imageUrl, fileUrl, type } = await req.json();
    console.log("AI API called with:", { prompt, imageUrl, fileUrl, type });

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

    // Handle image/PDF to text generation
    if (imageUrl || fileUrl) {
      const targetUrl = imageUrl || fileUrl;
      console.log("Processing image/PDF to text using free OCR...");

      try {
        // Use our free text extraction API
        const extractResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/extract-text-free`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileUrl: targetUrl }),
        });

        const extractData = await extractResponse.json();

        if (extractData.success && extractData.text) {
          return NextResponse.json([
            {
              generated_text: extractData.text,
            },
          ]);
        } else {
          throw new Error(extractData.error || "Text extraction failed");
        }

      } catch (error) {
        console.error("Error processing image/PDF:", error);
        return NextResponse.json([
          {
            generated_text: "Unable to process the uploaded file. Please try uploading a different file or contact support.",
          },
        ]);
      }
    }

    // Handle text-only prompts (fallback to text generation)
    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json([
        { generated_text: "Please provide a question or prompt, or upload an image/PDF." },
      ]);
    }

    console.log("Processing text using local AI...");

    // Simple local text processing
    const words = prompt.toLowerCase().split(/\s+/);
    let response = "";

    if (words.includes("hello") || words.includes("hi")) {
      response = "Hello! I'm here to help you with your studies. You can ask me questions about any topic, and I'll do my best to provide helpful information.";
    } else if (words.includes("what") || words.includes("explain")) {
      response = "I'd be happy to explain that topic for you. Based on your question, here's what I can tell you: This appears to be an educational query that would benefit from a structured explanation with key concepts and practical examples.";
    } else if (words.includes("how")) {
      response = "Here's how you can approach this: 1) Start by understanding the basic concepts, 2) Practice with examples, 3) Apply the knowledge to real situations, and 4) Review regularly to reinforce your learning.";
    } else if (words.includes("why")) {
      response = "That's a great question! Understanding the 'why' behind concepts is crucial for deep learning. The reason this is important is because it helps you connect different ideas and apply knowledge in various contexts.";
    } else {
      response = `I understand you're asking about "${prompt.substring(0, 50)}...". This is an interesting topic that involves several key concepts. For effective learning, I recommend breaking this down into smaller parts and connecting it to what you already know.`;
    }

    return NextResponse.json([
      {
        generated_text: response,
      },
    ]);

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
