import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notes, summaries, quizzes, studyHistory } from "@/lib/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const noteId = searchParams.get("noteId");

    if (noteId) {
      // Get single note with related data
      const [note] = await db
        .select({
          id: notes.id,
          title: notes.title,
          content: notes.content,
          fileUrl: notes.fileUrl,
          createdAt: notes.createdAt,
          summaryCount: sql<number>`count(distinct ${summaries.id})`,
          quizCount: sql<number>`count(distinct ${quizzes.id})`,
        })
        .from(notes)
        .leftJoin(summaries, eq(notes.id, summaries.noteId))
        .leftJoin(quizzes, eq(notes.id, quizzes.noteId))
        .where(and(eq(notes.id, parseInt(noteId)), eq(notes.userId, userId)))
        .groupBy(notes.id);

      if (!note) {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }

      // Track view in study history
      await db.insert(studyHistory).values({
        userId,
        noteId: parseInt(noteId),
        action: "review",
        details: { type: "note_view" }
      });

      return NextResponse.json({
        success: true,
        note
      });
    }

    // Get all notes with summary data
    const allNotes = await db
      .select({
        id: notes.id,
        title: notes.title,
        content: sql<string>`substring(${notes.content}, 1, 200)`, // Preview only
        fileUrl: notes.fileUrl,
        createdAt: notes.createdAt,
        summaryCount: sql<number>`count(distinct ${summaries.id})`,
        quizCount: sql<number>`count(distinct ${quizzes.id})`,
      })
      .from(notes)
      .leftJoin(summaries, eq(notes.id, summaries.noteId))
      .leftJoin(quizzes, eq(notes.id, quizzes.noteId))
      .where(eq(notes.userId, userId))
      .groupBy(notes.id)
      .orderBy(desc(notes.createdAt))
      .limit(limit);

    return NextResponse.json({
      success: true,
      notes: allNotes
    });

  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ 
      error: "Failed to fetch notes", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

// Create or update note
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { title, content, fileUrl } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const [savedNote] = await db.insert(notes).values({
      userId,
      title,
      content,
      fileUrl: fileUrl || null,
    }).returning();

    // Track in study history
    await db.insert(studyHistory).values({
      userId,
      noteId: savedNote.id,
      action: "upload",
      details: { 
        method: fileUrl ? "file_upload" : "manual_entry",
        contentLength: content.length 
      }
    });

    return NextResponse.json({
      success: true,
      note: savedNote
    });

  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json({ 
      error: "Failed to create note", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}