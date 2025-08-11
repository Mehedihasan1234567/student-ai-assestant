import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Testing Hugging Face API key...");

    if (!process.env.HUGGINGFACE_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: "HUGGINGFACE_API_KEY not found in environment variables" 
      });
    }

    // Test with a simple, always-available model
    const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: "Hello, this is a test",
        parameters: {
          max_length: 50,
          temperature: 0.7,
        },
      }),
    });

    console.log("HF API Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HF API Error:", errorText);
      
      return NextResponse.json({
        success: false,
        status: response.status,
        error: errorText,
        message: response.status === 403 ? 
          "API key doesn't have proper permissions" : 
          "API request failed"
      });
    }

    const data = await response.json();
    console.log("HF API Success:", data);

    return NextResponse.json({
      success: true,
      message: "Hugging Face API key is working correctly",
      testResponse: data
    });

  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}