import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizzes, notes, quizAttempts } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get("noteId");
    const limit = parseInt(searchParams.get("limit") || "10");

    console.log("Get quizzes API called");

    let query = db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        questions: quizzes.questions,
        createdAt: quizzes.createdAt,
        noteId: quizzes.noteId,
        noteTitle: notes.title,
        // Count attempts for this quiz
        attemptCount: sql<number>`count(${quizAttempts.id})`,
        // Average score for this quiz
        avgScore: sql<number>`avg(${quizAttempts.score}::float / ${quizAttempts.totalQuestions} * 100)`,
      })
      .from(quizzes)
      .leftJoin(notes, eq(quizzes.noteId, notes.id))
      .leftJoin(quizAttempts, eq(quizzes.id, quizAttempts.quizId))
      .groupBy(quizzes.id, notes.title)
      .orderBy(desc(quizzes.createdAt))
      .limit(limit);

    // Filter by noteId if provided
    if (noteId) {
      query = query.where(eq(quizzes.noteId, parseInt(noteId)));
    }

    const result = await query;

    return NextResponse.json({
      success: true,
      quizzes: result.map(quiz => ({
        ...quiz,
        questionCount: Array.isArray(quiz.questions) ? quiz.questions.length : 0,
        avgScore: Math.round(quiz.avgScore || 0),
        // Don't send full questions in list view for performance
        questions: undefined
      }))
    });

  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json({ 
      error: "Failed to fetch quizzes", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

// Get single quiz by ID with full questions
export async function POST(req: Request) {
  try {
    const { quizId } = await req.json();

    if (!quizId) {
      return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 });
    }

    const [quiz] = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        questions: quizzes.questions,
        createdAt: quizzes.createdAt,
        noteId: quizzes.noteId,
        noteTitle: notes.title,
      })
      .from(quizzes)
      .leftJoin(notes, eq(quizzes.noteId, notes.id))
      .where(eq(quizzes.id, parseInt(quizId)));

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Get quiz attempts for this quiz
    const attempts = await db
      .select({
        id: quizAttempts.id,
        score: quizAttempts.score,
        totalQuestions: quizAttempts.totalQuestions,
        completedAt: quizAttempts.completedAt,
      })
      .from(quizAttempts)
      .where(eq(quizAttempts.quizId, parseInt(quizId)))
      .orderBy(desc(quizAttempts.completedAt));

    return NextResponse.json({
      success: true,
      quiz: {
        ...quiz,
        attempts,
        questionCount: Array.isArray(quiz.questions) ? quiz.questions.length : 0,
      }
    });

  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json({ 
      error: "Failed to fetch quiz", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}