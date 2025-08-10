import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { summaries, notes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get("noteId");
    const limit = parseInt(searchParams.get("limit") || "10");

    console.log("Get summaries API called");

    let query = db
      .select({
        id: summaries.id,
        title: summaries.title,
        summary: summaries.summary,
        keyPoints: summaries.keyPoints,
        createdAt: summaries.createdAt,
        noteId: summaries.noteId,
        noteTitle: notes.title,
      })
      .from(summaries)
      .leftJoin(notes, eq(summaries.noteId, notes.id))
      .orderBy(desc(summaries.createdAt))
      .limit(limit);

    // Filter by noteId if provided
    if (noteId) {
      query = query.where(eq(summaries.noteId, parseInt(noteId)));
    }

    const result = await query;

    return NextResponse.json({
      success: true,
      summaries: result,
    });
  } catch (error) {
    console.error("Error fetching summaries:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch summaries",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Get single summary by ID
export async function POST(req: Request) {
  try {
    const { summaryId } = await req.json();

    if (!summaryId) {
      return NextResponse.json(
        { error: "Summary ID is required" },
        { status: 400 }
      );
    }

    const [summary] = await db
      .select({
        id: summaries.id,
        title: summaries.title,
        summary: summaries.summary,
        keyPoints: summaries.keyPoints,
        createdAt: summaries.createdAt,
        noteId: summaries.noteId,
        noteTitle: notes.title,
        noteContent: notes.content,
      })
      .from(summaries)
      .leftJoin(notes, eq(summaries.noteId, notes.id))
      .where(eq(summaries.id, parseInt(summaryId)));

    if (!summary) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch summary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
