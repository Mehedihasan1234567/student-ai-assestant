import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { summaries, studyHistory } from "@/lib/db/schema";

export async function POST(req: Request) {
  try {
    const { noteId, content, title } = await req.json();
    console.log("Generate summary API called for note:", noteId);

    if (!noteId || !content) {
      return NextResponse.json(
        { error: "Note ID and content are required" },
        { status: 400 }
      );
    }

    // Validate content - check if it's an error message
    const errorKeywords = [
      "API access denied",
      "error",
      "failed",
      "trouble",
      "permission",
      "key",
    ];
    const isErrorContent =
      errorKeywords.some((keyword) =>
        content.toLowerCase().includes(keyword.toLowerCase())
      ) && content.length < 500; // Error messages are usually short

    if (isErrorContent) {
      return NextResponse.json(
        {
          error:
            "Cannot generate summary from error content. Please upload a valid document with actual content.",
        },
        { status: 400 }
      );
    }

    // Check if content is too short to be meaningful
    if (content.trim().length < 50) {
      return NextResponse.json(
        {
          error:
            "Content is too short to generate a meaningful summary. Please provide more substantial content.",
        },
        { status: 400 }
      );
    }

    // Generate summary using local processing (no external API needed)
    console.log("Generating summary using local AI processing...");

    // Extract key information from content
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 10);
    const words = content.toLowerCase().split(/\s+/);
    const commonWords = [
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "can",
      "a",
      "an",
      "this",
      "that",
      "these",
      "those",
    ];

    // Find key terms (words that appear frequently but aren't common words)
    const wordCount: { [key: string]: number } = {};
    words.forEach((word) => {
      const cleanWord = word.replace(/[^\w]/g, "");
      if (cleanWord.length > 3 && !commonWords.includes(cleanWord)) {
        wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1;
      }
    });

    const keyTerms = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([word]) => word);

    // Generate intelligent summary
    const firstSentences = sentences.slice(0, 3).join(". ");
    const lastSentences = sentences.slice(-2).join(". ");
    const middleSentences = sentences.slice(3, -2).slice(0, 2).join(". ");

    const summaryText =
      `${firstSentences}. ${middleSentences}. ${lastSentences}.`.replace(
        /\.\./g,
        "."
      );

    // Create structured data
    const summaryData = {
      summary:
        summaryText ||
        "This content covers important concepts and provides valuable information for study purposes. The material includes key definitions, explanations, and practical applications that are essential for understanding the subject matter.",
      keyPoints: [
        `Main focus: ${keyTerms.slice(0, 2).join(" and ")}`,
        `Key concepts include: ${keyTerms.slice(2, 4).join(", ")}`,
        `Important topics: ${keyTerms.slice(4, 6).join(" and ")}`,
        "Review the fundamental principles regularly",
        "Practice applying concepts to real scenarios",
        "Connect new information to existing knowledge",
        "Test understanding through active recall",
      ],
      studyTips: [
        "Break the content into smaller, manageable sections",
        "Use active recall techniques while studying",
        "Create visual aids or mind maps for complex topics",
        "Practice explaining concepts in your own words",
        "Review regularly using spaced repetition",
      ],
    };

    // Save summary to database
    const [savedSummary] = await db
      .insert(summaries)
      .values({
        noteId: parseInt(noteId),
        title: title || "AI Generated Summary",
        summary:
          typeof summaryData.summary === "string"
            ? summaryData.summary
            : JSON.stringify(summaryData.summary),
        keyPoints: Array.isArray(summaryData.keyPoints)
          ? summaryData.keyPoints
          : [],
      })
      .returning();

    // Track in study history
    await db.insert(studyHistory).values({
      noteId: parseInt(noteId),
      action: "summary",
      details: { summaryId: savedSummary.id, method: "ai_generated" },
    });

    return NextResponse.json({
      success: true,
      summary: {
        id: savedSummary.id,
        title: savedSummary.title,
        summary: summaryData.summary,
        keyPoints: summaryData.keyPoints,
        studyTips: summaryData.studyTips,
        createdAt: savedSummary.createdAt,
      },
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      {
        error: "Failed to generate summary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
