import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { summaries, studyHistory } from "@/lib/db/schema";

export async function POST(req: Request) {
  try {
    const { noteId, content, title } = await req.json();
    console.log("Generate summary API called for note:", noteId);

    if (!noteId || !content) {
      return NextResponse.json({ error: "Note ID and content are required" }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    // Generate summary using AI
    const summaryPrompt = `
Please create a comprehensive study summary for the following content. 
Format your response as a JSON object with these fields:
- summary: A detailed summary (200-300 words)
- keyPoints: An array of 5-7 key points
- studyTips: An array of 3-4 study tips

Content to summarize:
${content.substring(0, 3000)}...
`;

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
            content: "You are an expert study assistant. Create comprehensive, well-structured summaries that help students learn effectively. Always respond with valid JSON format."
          },
          {
            role: "user",
            content: summaryPrompt
          }
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error("OpenRouter API error:", response.status);
      return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";

    // Try to parse JSON response, fallback to plain text
    let summaryData;
    try {
      summaryData = JSON.parse(aiResponse);
    } catch {
      // Fallback: create structured data from plain text
      summaryData = {
        summary: aiResponse,
        keyPoints: [
          "Review the main concepts regularly",
          "Practice with examples",
          "Connect ideas to real-world applications",
          "Test your understanding with questions"
        ],
        studyTips: [
          "Break content into smaller sections",
          "Use active recall techniques",
          "Create visual aids or diagrams"
        ]
      };
    }

    // Save summary to database
    const [savedSummary] = await db.insert(summaries).values({
      noteId: parseInt(noteId),
      title: title || "AI Generated Summary",
      summary: summaryData.summary,
      keyPoints: summaryData.keyPoints,
    }).returning();

    // Track in study history
    await db.insert(studyHistory).values({
      noteId: parseInt(noteId),
      action: "summary",
      details: { summaryId: savedSummary.id, method: "ai_generated" }
    });

    return NextResponse.json({
      success: true,
      summary: {
        id: savedSummary.id,
        title: savedSummary.title,
        summary: summaryData.summary,
        keyPoints: summaryData.keyPoints,
        studyTips: summaryData.studyTips,
        createdAt: savedSummary.createdAt
      }
    });

  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json({ 
      error: "Failed to generate summary", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}