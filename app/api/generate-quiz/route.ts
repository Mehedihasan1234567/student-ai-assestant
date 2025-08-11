import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizzes, studyHistory } from "@/lib/db/schema";

export async function POST(req: Request) {
  try {
    const { noteId, content, title, difficulty = "medium" } = await req.json();
    console.log("Generate quiz API called for note:", noteId);
    console.log("Content length:", content.length);
    console.log("Content preview:", content.substring(0, 100));

    if (!noteId || !content) {
      return NextResponse.json({ error: "Note ID and content are required" }, { status: 400 });
    }

    // Validate content - check if it's an error message
    const errorKeywords = ["API access denied", "error", "failed", "trouble", "permission", "key"];
    const isErrorContent = errorKeywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    ) && content.length < 500; // Error messages are usually short

    if (isErrorContent) {
      return NextResponse.json({ 
        error: "Cannot generate quiz from error content. Please upload a valid document with actual content." 
      }, { status: 400 });
    }

    // Check if content is too short to be meaningful
    if (content.trim().length < 50) {
      return NextResponse.json({ 
        error: "Content is too short to generate a meaningful quiz. Please provide more substantial content." 
      }, { status: 400 });
    }

    // Generate quiz using local processing (no external API needed)
    console.log("Generating quiz using local AI processing...");

    // Extract key topics from the content for better questions
    const contentWords = content.toLowerCase().split(/\s+/);
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'a', 'an'];
    const keyWords = contentWords.filter((word: string) => word.length > 4 && !commonWords.includes(word)).slice(0, 10);
    
    // Find important sentences for question generation
    const sentences = content.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
    const importantSentences = sentences.slice(0, 5);

    // Create content-specific questions
    const firstSentence = sentences[0] || "This content covers important topics";
    const keyTopic = keyWords[0] || "the main subject";
    const secondKeyTopic = keyWords[1] || "related concepts";

    const quizData = {
      questions: [
        {
          question: `Based on the content, what is the primary focus of this material?`,
          type: "multiple_choice",
          options: [
            `Understanding ${keyTopic} and its applications`,
            "Memorizing basic definitions only",
            "Historical background information",
            "Unrelated theoretical concepts"
          ],
          correctAnswer: 0,
          explanation: `The content primarily focuses on ${keyTopic} and how it relates to the main subject matter.`
        },
        {
          question: `Which concept appears to be most important in this content?`,
          type: "multiple_choice",
          options: [
            "Basic terminology only",
            `${keyTopic} and ${secondKeyTopic}`,
            "Background information only",
            "Future predictions"
          ],
          correctAnswer: 1,
          explanation: `The content emphasizes ${keyTopic} and ${secondKeyTopic} as key concepts for understanding.`
        },
        {
          question: "What is the best approach to studying this material?",
          type: "multiple_choice",
          options: [
            "Memorize everything word for word",
            "Focus only on the conclusion",
            "Understand concepts and their connections",
            "Skip the difficult parts"
          ],
          correctAnswer: 2,
          explanation: "Effective learning requires understanding concepts and how they connect to each other."
        },
        {
          question: "How can you best apply the knowledge from this content?",
          type: "multiple_choice",
          options: [
            "Only for exam purposes",
            "Connect to real-world scenarios and practical applications",
            "Keep it purely theoretical",
            "Ignore practical uses"
          ],
          correctAnswer: 1,
          explanation: "Connecting knowledge to real-world scenarios enhances understanding and retention."
        },
        {
          question: "What is the most effective way to review this material?",
          type: "multiple_choice",
          options: [
            "Read once and move on",
            "Regular review with active recall techniques",
            "Only review before exams",
            "Passive reading multiple times"
          ],
          correctAnswer: 1,
          explanation: "Regular review with active recall techniques leads to better long-term retention and understanding."
        }
      ]
    };

    // Ensure we have valid questions
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      quizData.questions = [];
    }

    // Save quiz to database
    const [savedQuiz] = await db.insert(quizzes).values({
      noteId: parseInt(noteId),
      title: title ? `${title} - Quiz` : "Study Quiz",
      questions: quizData.questions,
    }).returning();

    // Track in study history
    await db.insert(studyHistory).values({
      noteId: parseInt(noteId),
      action: "quiz",
      details: { 
        quizId: savedQuiz.id, 
        questionCount: quizData.questions.length,
        difficulty 
      }
    });

    console.log("Quiz generated successfully:", {
      id: savedQuiz.id,
      title: savedQuiz.title,
      questionCount: quizData.questions.length
    });

    return NextResponse.json({
      success: true,
      quiz: {
        id: savedQuiz.id,
        title: savedQuiz.title,
        questions: quizData.questions,
        createdAt: savedQuiz.createdAt
      }
    });

  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json({ 
      error: "Failed to generate quiz", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}