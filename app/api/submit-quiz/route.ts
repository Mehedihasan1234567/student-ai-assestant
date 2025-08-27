import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizAttempts, quizzes, studyHistory } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { quizId, answers } = await req.json();
    console.log("Submit quiz API called for quiz:", quizId);

    if (!quizId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Quiz ID and answers are required" }, { status: 400 });
    }

    // Get quiz questions from database
    const [quiz] = await db.select().from(quizzes).where(and(eq(quizzes.id, parseInt(quizId)), eq(quizzes.userId, userId)));
    
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const questions = quiz.questions as any[];
    let score = 0;
    const results = [];

    // Calculate score and create detailed results
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const userAnswer = answers[i];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        score++;
      }

      results.push({
        questionIndex: i,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation || "No explanation provided",
        options: question.options
      });
    }

    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    // Save quiz attempt to database
    const [savedAttempt] = await db.insert(quizAttempts).values({
      userId,
      quizId: parseInt(quizId),
      score,
      totalQuestions,
      answers: answers,
    }).returning();

    // Track in study history
    await db.insert(studyHistory).values({
      userId,
      noteId: quiz.noteId,
      action: "quiz_attempt",
      details: { 
        quizId: parseInt(quizId),
        attemptId: savedAttempt.id,
        score,
        percentage,
        totalQuestions
      }
    });

    // Determine performance level
    let performanceLevel = "needs_improvement";
    let message = "আরো অনুশীলন প্রয়োজন। আবার চেষ্টা করুন!";
    
    if (percentage >= 80) {
      performanceLevel = "excellent";
      message = "চমৎকার! আপনি বিষয়টি ভালোভাবে বুঝেছেন।";
    } else if (percentage >= 60) {
      performanceLevel = "good";
      message = "ভালো! আরো কিছু অনুশীলন করলে আরো ভালো হবে।";
    } else if (percentage >= 40) {
      performanceLevel = "fair";
      message = "মোটামুটি। আরো পড়াশোনা করুন এবং আবার চেষ্টা করুন।";
    }

    return NextResponse.json({
      success: true,
      result: {
        attemptId: savedAttempt.id,
        score,
        totalQuestions,
        percentage,
        performanceLevel,
        message,
        results,
        completedAt: savedAttempt.completedAt
      }
    });

  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json({ 
      error: "Failed to submit quiz", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}