import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studyHistory, notes, summaries, quizzes, quizAttempts } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const action = searchParams.get("action"); // filter by action type

    console.log("Study history API called");

    // Build query with joins to get related data
    let query = db
      .select({
        id: studyHistory.id,
        action: studyHistory.action,
        details: studyHistory.details,
        createdAt: studyHistory.createdAt,
        noteTitle: notes.title,
        noteId: notes.id,
      })
      .from(studyHistory)
      .leftJoin(notes, eq(studyHistory.noteId, notes.id))
      .orderBy(desc(studyHistory.createdAt))
      .limit(limit);

    // Add action filter if specified
    if (action) {
      query = query.where(eq(studyHistory.action, action));
    }

    const history = await query;

    // Get summary statistics
    const stats = await db
      .select({
        totalNotes: sql<number>`count(distinct ${notes.id})`,
        totalSummaries: sql<number>`count(distinct ${summaries.id})`,
        totalQuizzes: sql<number>`count(distinct ${quizzes.id})`,
        totalQuizAttempts: sql<number>`count(distinct ${quizAttempts.id})`,
      })
      .from(notes)
      .leftJoin(summaries, eq(notes.id, summaries.noteId))
      .leftJoin(quizzes, eq(notes.id, quizzes.noteId))
      .leftJoin(quizAttempts, eq(quizzes.id, quizAttempts.quizId));

    // Get recent activity summary
    const recentActivity = await db
      .select({
        action: studyHistory.action,
        count: sql<number>`count(*)`,
      })
      .from(studyHistory)
      .where(sql`${studyHistory.createdAt} >= NOW() - INTERVAL '7 days'`)
      .groupBy(studyHistory.action);

    // Calculate average quiz scores
    const avgQuizScore = await db
      .select({
        avgScore: sql<number>`avg(${quizAttempts.score}::float / ${quizAttempts.totalQuestions} * 100)`,
        totalAttempts: sql<number>`count(*)`,
      })
      .from(quizAttempts);

    return NextResponse.json({
      success: true,
      data: {
        history: history.map(item => ({
          id: item.id,
          action: item.action,
          details: item.details,
          createdAt: item.createdAt,
          noteTitle: item.noteTitle,
          noteId: item.noteId,
          // Add Bengali action labels
          actionLabel: getActionLabel(item.action),
        })),
        statistics: {
          totalNotes: stats[0]?.totalNotes || 0,
          totalSummaries: stats[0]?.totalSummaries || 0,
          totalQuizzes: stats[0]?.totalQuizzes || 0,
          totalQuizAttempts: stats[0]?.totalQuizAttempts || 0,
          averageQuizScore: Math.round(avgQuizScore[0]?.avgScore || 0),
          totalQuizAttempts: avgQuizScore[0]?.totalAttempts || 0,
        },
        recentActivity: recentActivity.map(activity => ({
          action: activity.action,
          actionLabel: getActionLabel(activity.action),
          count: activity.count,
        })),
      }
    });

  } catch (error) {
    console.error("Error fetching study history:", error);
    return NextResponse.json({ 
      error: "Failed to fetch study history", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    upload: "নোট আপলোড",
    summary: "সারসংক্ষেপ তৈরি",
    quiz: "কুইজ তৈরি", 
    quiz_attempt: "কুইজ অংশগ্রহণ",
    review: "পর্যালোচনা",
  };
  return labels[action] || action;
}