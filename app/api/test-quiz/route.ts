import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Testing quiz generation...");

    const testContent = `
# Introduction to Machine Learning

Machine learning is a subset of artificial intelligence (AI) that focuses on the development of algorithms and statistical models that enable computer systems to improve their performance on a specific task through experience, without being explicitly programmed.

## Key Concepts

### 1. Supervised Learning
Supervised learning involves training a model on a labeled dataset, where the correct output is provided for each input. Common examples include:
- Classification: Predicting categories (e.g., spam vs. not spam)
- Regression: Predicting continuous values (e.g., house prices)

### 2. Unsupervised Learning
Unsupervised learning works with unlabeled data to find hidden patterns. Examples include:
- Clustering: Grouping similar data points
- Dimensionality reduction: Simplifying data while preserving important features

### 3. Reinforcement Learning
This approach involves an agent learning to make decisions by receiving rewards or penalties for its actions in an environment.

## Applications

Machine learning has numerous real-world applications:
- Image recognition and computer vision
- Natural language processing
- Recommendation systems
- Autonomous vehicles
- Medical diagnosis
- Financial fraud detection
`;

    // Test the quiz generation logic
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/generate-quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        noteId: "test-123",
        content: testContent,
        title: "Test Quiz",
        difficulty: "medium"
      }),
    });

    const data = await response.json();
    console.log("Quiz test result:", data);

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      data: data,
      message: response.ok ? "Quiz generation test successful" : "Quiz generation test failed"
    });

  } catch (error) {
    console.error("Quiz test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}