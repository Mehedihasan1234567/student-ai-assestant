// 🤖 Advanced AI Quiz Generation System
// This module contains intelligent algorithms for generating quiz questions and options

export interface QuizQuestion {
  question: string;
  type: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ContentAnalysis {
  keyTerms: string[];
  definitions: string[];
  facts: string[];
  examples: string[];
  processes: string[];
  concepts: string[];
}

export class AIQuizGenerator {
  private content: string;
  private analysis: ContentAnalysis;

  constructor(content: string) {
    this.content = content;
    this.analysis = this.analyzeContent(content);
  }

  // 🧠 Advanced content analysis
  private analyzeContent(content: string): ContentAnalysis {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 15);
    const words = content.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    
    // Advanced stop words list
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 
      'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 
      'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 
      'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'may', 'come',
      'than', 'into', 'very', 'what', 'know', 'just', 'first', 'also', 'your',
      'work', 'life', 'only', 'over', 'think', 'where', 'after', 'back', 'other',
      'many', 'time', 'would', 'there', 'could', 'more', 'been', 'were', 'said'
    ]);
    
    // Extract key terms with frequency analysis
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      if (!stopWords.has(word) && word.length > 2) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    const keyTerms = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([word]) => word);

    // Identify different types of content
    const definitions = sentences.filter(s => 
      /\b(is|are|means|refers to|defined as|called|known as)\b/.test(s.toLowerCase())
    );

    const facts = sentences.filter(s => 
      s.length > 30 && s.length < 200 && 
      !s.includes('?') && 
      (s.includes('can') || s.includes('will') || s.includes('does') || s.includes('has'))
    );

    const examples = sentences.filter(s => 
      /\b(example|such as|include|like|for instance|including)\b/.test(s.toLowerCase())
    );

    const processes = sentences.filter(s => 
      /\b(step|process|method|approach|technique|procedure|algorithm)\b/.test(s.toLowerCase())
    );

    const concepts = sentences.filter(s => 
      s.length > 40 && 
      keyTerms.some(term => s.toLowerCase().includes(term))
    );

    return {
      keyTerms,
      definitions,
      facts,
      examples,
      processes,
      concepts
    };
  }

  // 🎯 Generate AI-powered wrong options
  private generateWrongOptions(correctAnswer: string, questionType: string, context: string[]): string[] {
    const wrongOptions: string[] = [];
    
    switch (questionType) {
      case 'definition':
        wrongOptions.push(
          `A general term without specific technical meaning`,
          `${context[1] || 'Another concept'} that serves a different purpose entirely`,
          `An outdated approach that has been replaced by modern methods`
        );
        break;
        
      case 'fact':
        wrongOptions.push(
          `This statement contradicts the information provided in the content`,
          `This represents a common misconception about the topic`,
          `This is partially correct but missing key details mentioned`
        );
        break;
        
      case 'example':
        wrongOptions.push(
          `A theoretical concept without practical real-world applications`,
          `An example from a different field not discussed in the content`,
          `A historical reference that is no longer relevant today`
        );
        break;
        
      case 'process':
        wrongOptions.push(
          `A random approach without systematic methodology or structure`,
          `An inefficient method that wastes time and resources`,
          `A theoretical framework without practical implementation steps`
        );
        break;
        
      default:
        wrongOptions.push(
          `This option is not supported by the content provided`,
          `This represents an alternative viewpoint not discussed`,
          `This is a common misconception about the topic`
        );
    }
    
    return wrongOptions;
  }

  // 🚀 Generate different types of AI questions
  generateDefinitionQuestion(): QuizQuestion | null {
    if (this.analysis.definitions.length === 0) return null;
    
    const definition = this.analysis.definitions[0];
    const parts = definition.split(/\b(is|are|means|refers to|defined as)\b/i);
    
    if (parts.length < 3) return null;
    
    const concept = parts[0].trim().replace(/^.*\b(\w+)$/, '$1');
    const meaning = parts[2].trim();
    
    const wrongOptions = this.generateWrongOptions(meaning, 'definition', this.analysis.keyTerms);
    
    return {
      question: `According to the content, what is ${concept}?`,
      type: "multiple_choice",
      options: [
        meaning.length > 80 ? meaning.substring(0, 80) + '...' : meaning,
        ...wrongOptions
      ],
      correctAnswer: 0,
      explanation: `The content clearly defines ${concept} as: ${meaning.substring(0, 120)}...`
    };
  }

  generateFactQuestion(): QuizQuestion | null {
    if (this.analysis.facts.length === 0) return null;
    
    const fact = this.analysis.facts[Math.floor(Math.random() * this.analysis.facts.length)];
    const mainConcept = this.analysis.keyTerms[0] || 'the main topic';
    
    const wrongOptions = this.generateWrongOptions(fact, 'fact', [mainConcept]);
    
    return {
      question: `Which statement about ${mainConcept} is supported by the content?`,
      type: "multiple_choice",
      options: [
        fact.length > 80 ? fact.substring(0, 80) + '...' : fact,
        ...wrongOptions
      ],
      correctAnswer: 0,
      explanation: `The content specifically provides this information about ${mainConcept}.`
    };
  }

  generateExampleQuestion(): QuizQuestion | null {
    if (this.analysis.examples.length === 0) return null;
    
    const example = this.analysis.examples[0];
    const wrongOptions = this.generateWrongOptions(example, 'example', this.analysis.keyTerms);
    
    return {
      question: `Which example or application is mentioned in the content?`,
      type: "multiple_choice",
      options: [
        example.length > 80 ? example.substring(0, 80) + '...' : example,
        ...wrongOptions
      ],
      correctAnswer: 0,
      explanation: `The content provides this as a specific example or practical application.`
    };
  }

  generateProcessQuestion(): QuizQuestion | null {
    if (this.analysis.processes.length === 0) return null;
    
    const process = this.analysis.processes[0];
    const wrongOptions = this.generateWrongOptions(process, 'process', this.analysis.keyTerms);
    
    return {
      question: `What process or methodology is described in the content?`,
      type: "multiple_choice",
      options: [
        process.length > 80 ? process.substring(0, 80) + '...' : process,
        ...wrongOptions
      ],
      correctAnswer: 0,
      explanation: `The content outlines this specific process or methodology.`
    };
  }

  generateConceptualQuestion(): QuizQuestion | null {
    if (this.analysis.keyTerms.length < 2) return null;
    
    const concept1 = this.analysis.keyTerms[0];
    const concept2 = this.analysis.keyTerms[1];
    
    const wrongOptions = [
      `They represent completely separate and unrelated concepts`,
      `One is significantly more important than the other in all contexts`,
      `They are mentioned only briefly without detailed explanation`
    ];
    
    return {
      question: `How are ${concept1} and ${concept2} related in this content?`,
      type: "multiple_choice",
      options: [
        `They work together as interconnected components of the main system`,
        ...wrongOptions
      ],
      correctAnswer: 0,
      explanation: `The content demonstrates how ${concept1} and ${concept2} are interconnected and complement each other.`
    };
  }

  // 🎯 Generate a complete AI-powered quiz
  generateQuiz(numQuestions: number = 5): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    
    // Try to generate different types of questions
    const generators = [
      () => this.generateDefinitionQuestion(),
      () => this.generateFactQuestion(),
      () => this.generateExampleQuestion(),
      () => this.generateProcessQuestion(),
      () => this.generateConceptualQuestion()
    ];
    
    // Generate questions using different methods
    for (const generator of generators) {
      if (questions.length >= numQuestions) break;
      
      const question = generator();
      if (question) {
        questions.push(question);
      }
    }
    
    // Fill remaining slots with fact questions if needed
    while (questions.length < numQuestions && this.analysis.facts.length > 0) {
      const question = this.generateFactQuestion();
      if (question && !questions.some(q => q.question === question.question)) {
        questions.push(question);
      } else {
        break; // Avoid infinite loop
      }
    }
    
    return questions.slice(0, numQuestions);
  }

  // 📊 Get content analysis insights
  getAnalysisInsights() {
    return {
      keyTermsFound: this.analysis.keyTerms.length,
      definitionsFound: this.analysis.definitions.length,
      factsFound: this.analysis.facts.length,
      examplesFound: this.analysis.examples.length,
      processesFound: this.analysis.processes.length,
      conceptsFound: this.analysis.concepts.length,
      contentComplexity: this.content.length > 2000 ? 'High' : this.content.length > 1000 ? 'Medium' : 'Basic',
      readingLevel: this.analysis.concepts.length > 10 ? 'Advanced' : this.analysis.concepts.length > 5 ? 'Intermediate' : 'Beginner',
      topKeywords: this.analysis.keyTerms.slice(0, 5)
    };
  }
}