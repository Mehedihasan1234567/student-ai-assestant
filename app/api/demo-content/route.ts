import { NextResponse } from "next/server";

export async function GET() {
  const sampleContent = `
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

## Getting Started

To begin with machine learning:
1. Learn programming (Python is popular)
2. Understand statistics and linear algebra
3. Practice with datasets
4. Use libraries like scikit-learn, TensorFlow, or PyTorch
5. Work on projects to build experience

Machine learning is a rapidly evolving field with immense potential for solving complex problems across various industries.
`;

  return NextResponse.json({
    success: true,
    content: sampleContent.trim(),
    fileName: "Machine Learning Introduction.md",
    fileUrl: "demo://sample-content"
  });
}