import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizzes, studyHistory } from "@/lib/db/schema";
import { AIQuizGenerator } from "@/lib/ai-quiz-generator";

export async function POST(req: Request) {
  try {
    const { noteId, content, title, difficulty = "medium" } = await req.json();
    console.log("Generate quiz API called for note:", noteId);
    console.log("Content length:", content.length);
    console.log("Content preview:", content.substring(0, 100));

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
            "Cannot generate quiz from error content. Please upload a valid document with actual content.",
        },
        { status: 400 }
      );
    }

    // Check if content is too short to be meaningful
    if (content.trim().length < 50) {
      return NextResponse.json(
        {
          error:
            "Content is too short to generate a meaningful quiz. Please provide more substantial content.",
        },
        { status: 400 }
      );
    }

    // 🤖 ADVANCED AI-POWERED QUIZ GENERATION
    console.log("🧠 Initializing Advanced AI Quiz Generator...");
    
    // Create AI Quiz Generator instance
    const aiGenerator = new AIQuizGenerator(content);
    
    // Generate AI-powered quiz questions
    const aiQuestions = aiGenerator.generateQuiz(5);
    
    console.log(`✅ Generated ${aiQuestions.length} AI-powered questions`);

    const quizData = {
      questions: aiQuestions
    };

    // Ensure we have valid questions
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      quizData.questions = [];
    }

    // Save quiz to database
    const [savedQuiz] = await db
      .insert(quizzes)
      .values({
        noteId: parseInt(noteId),
        title: title ? `${title} - Quiz` : "Study Quiz",
        questions: quizData.questions,
      })
      .returning();

    // Track in study history
    await db.insert(studyHistory).values({
      noteId: parseInt(noteId),
      action: "quiz",
      details: {
        quizId: savedQuiz.id,
        questionCount: quizData.questions.length,
        difficulty,
      },
    });

    // Get AI analysis insights
    const analysisInsights = aiGenerator.getAnalysisInsights();

    console.log("Quiz generated successfully:", {
      id: savedQuiz.id,
      title: savedQuiz.title,
      questionCount: quizData.questions.length,
      analysis: analysisInsights,
    });

    return NextResponse.json({
      success: true,
      quiz: {
        id: savedQuiz.id,
        title: savedQuiz.title,
        questions: quizData.questions,
        createdAt: savedQuiz.createdAt,
        analysis: analysisInsights,
      },
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      {
        error: "Failed to generate quiz",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
