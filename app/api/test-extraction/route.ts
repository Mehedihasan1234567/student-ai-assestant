import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ 
        error: "No text provided",
        success: false 
      });
    }

    // Test with the provided text
    const testContent = text.substring(0, 1000); // First 1000 characters

    // Test summary generation
    let summaryResult = null;
    try {
      const summaryResponse = await fetch("http://localhost:3000/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteId: "999", // Test note ID
          content: testContent,
          title: "Test Summary"
        }),
      });
      
      summaryResult = await summaryResponse.json();
    } catch (error) {
      summaryResult = { error: "Summary generation failed" };
    }

    // Test quiz generation
    let quizResult = null;
    try {
      const quizResponse = await fetch("http://localhost:3000/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteId: "999", // Test note ID
          content: testContent,
          title: "Test Quiz"
        }),
      });
      
      quizResult = await quizResponse.json();
    } catch (error) {
      quizResult = { error: "Quiz generation failed" };
    }

    return NextResponse.json({
      success: true,
      textLength: text.length,
      testContent: testContent,
      summaryResult,
      quizResult
    });

  } catch (error) {
    console.error("Test extraction error:", error);
    return NextResponse.json({
      error: "Test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}