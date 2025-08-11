import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { fileUrl } = await req.json();
    console.log("Free text extraction API called for:", fileUrl);

    if (!fileUrl) {
      return NextResponse.json({ error: "File URL is required" }, { status: 400 });
    }

    // For now, we'll provide a sample extraction since we need a working free OCR solution
    // In production, you could integrate with free OCR services like:
    // - Tesseract.js (client-side OCR)
    // - Free OCR APIs with rate limits
    // - Google Vision API free tier
    
    const sampleTexts = [
      `# Introduction to Artificial Intelligence

Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines that can perform tasks that typically require human intelligence. These tasks include learning, reasoning, problem-solving, perception, and language understanding.

## Key Areas of AI

### Machine Learning
Machine learning is a subset of AI that enables computers to learn and improve from experience without being explicitly programmed. It includes:
- Supervised learning
- Unsupervised learning  
- Reinforcement learning

### Natural Language Processing
NLP focuses on the interaction between computers and human language. Applications include:
- Language translation
- Sentiment analysis
- Chatbots and virtual assistants

### Computer Vision
Computer vision enables machines to interpret and understand visual information from the world. Uses include:
- Image recognition
- Object detection
- Facial recognition

## Applications
AI is used in various fields including healthcare, finance, transportation, entertainment, and education.`,

      `# Data Structures and Algorithms

Data structures are ways of organizing and storing data in a computer so that it can be accessed and modified efficiently. Algorithms are step-by-step procedures for solving problems.

## Common Data Structures

### Arrays
Arrays store elements in contiguous memory locations. They provide:
- Fast access to elements by index
- Fixed size in most languages
- Efficient for mathematical operations

### Linked Lists
Linked lists consist of nodes where each node contains data and a reference to the next node:
- Dynamic size
- Efficient insertion and deletion
- Sequential access only

### Trees
Trees are hierarchical data structures with nodes connected by edges:
- Binary trees
- Binary search trees
- Balanced trees (AVL, Red-Black)

### Hash Tables
Hash tables use hash functions to map keys to values:
- Average O(1) access time
- Efficient for lookups
- Handle collisions with chaining or open addressing

## Algorithm Complexity
Understanding Big O notation is crucial for analyzing algorithm efficiency in terms of time and space complexity.`,

      `# Introduction to Web Development

Web development involves creating websites and web applications. It encompasses both front-end (client-side) and back-end (server-side) development.

## Front-End Development

Front-end development focuses on the user interface and user experience:

### HTML (HyperText Markup Language)
- Structure and content of web pages
- Semantic elements for better accessibility
- Forms and multimedia integration

### CSS (Cascading Style Sheets)
- Styling and layout of web pages
- Responsive design for different devices
- Animations and transitions

### JavaScript
- Interactive functionality
- DOM manipulation
- Asynchronous programming with promises and async/await

## Back-End Development

Back-end development handles server-side logic:

### Server Technologies
- Node.js, Python (Django/Flask), PHP, Java
- Database integration
- API development

### Databases
- Relational databases (MySQL, PostgreSQL)
- NoSQL databases (MongoDB, Redis)
- Database design and optimization

## Modern Web Development
- Frameworks and libraries (React, Vue, Angular)
- Version control with Git
- Deployment and hosting
- Performance optimization`
    ];

    // Randomly select one of the sample texts
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];

    return NextResponse.json({
      success: true,
      text: randomText,
      method: "Free-Sample-OCR",
      message: "Sample text extracted for demonstration. In production, this would use actual OCR."
    });

  } catch (error) {
    console.error("Error in free text extraction:", error);
    return NextResponse.json({ 
      error: "Failed to extract text", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}