import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizzes, studyHistory } from "@/lib/db/schema";

export async function POST(req: Request) {
  try {
    const { noteId, content, title, difficulty = "medium" } = await req.json();
    console.log("Generate quiz API called for note:", noteId);

    if (!noteId || !content) {
      return NextResponse.json({ error: "Note ID and content are required" }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    // Generate quiz using AI
    const quizPrompt = `
Create a study quiz based on the following content. Generate exactly 5 questions.
Difficulty level: ${difficulty}

Format your response as a JSON object with this structure:
{
  "questions": [
    {
      "question": "Question text here",
      "type": "multiple_choice",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}

Content for quiz:
${content.substring(0, 2500)}...

Make sure questions test understanding, not just memorization. Include a mix of conceptual and application questions.
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
            content: "You are an expert educator creating study quizzes. Generate challenging but fair questions that test comprehension. Always respond with valid JSON format."
          },
          {
            role: "user",
            content: quizPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      console.error("OpenRouter API error:", response.status);
      return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";

    // Try to parse JSON response, fallback to default questions
    let quizData;
    try {
      quizData = JSON.parse(aiResponse);
    } catch {
      // Fallback: create default quiz structure
      quizData = {
        questions: [
          {
            question: "What is the main topic of this content?",
            type: "multiple_choice",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 0,
            explanation: "This tests basic comprehension of the material."
          },
          {
            question: "Which concept is most important to understand?",
            type: "multiple_choice", 
            options: ["Concept 1", "Concept 2", "Concept 3", "All of the above"],
            correctAnswer: 3,
            explanation: "Understanding all concepts is crucial for mastery."
          }
        ]
      };
    }

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