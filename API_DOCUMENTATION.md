# 🧠 StudyMate AI Assistant - API Documentation

## 📋 Overview
Complete API documentation for the StudyMate AI Study Assistant application.

## 🔗 Base URL
```
http://localhost:3000/api
```

## 📚 API Endpoints

### 1. Notes Management

#### GET /api/notes
Get all notes with summary statistics
```bash
curl -X GET "http://localhost:3000/api/notes?limit=10"
```

#### GET /api/notes?noteId={id}
Get single note with details
```bash
curl -X GET "http://localhost:3000/api/notes?noteId=1"
```

#### POST /api/notes
Create a new note
```bash
curl -X POST "http://localhost:3000/api/notes" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Note","content":"Note content here","fileUrl":"optional"}'
```

### 2. AI Summary Generation

#### POST /api/generate-summary
Generate AI summary for a note
```bash
curl -X POST "http://localhost:3000/api/generate-summary" \
  -H "Content-Type: application/json" \
  -d '{"noteId":"1","content":"Note content","title":"Note Title"}'
```

#### GET /api/summaries
Get all summaries
```bash
curl -X GET "http://localhost:3000/api/summaries?limit=10&noteId=1"
```

#### POST /api/summaries
Get single summary by ID
```bash
curl -X POST "http://localhost:3000/api/summaries" \
  -H "Content-Type: application/json" \
  -d '{"summaryId":"1"}'
```

### 3. Quiz Management

#### POST /api/generate-quiz
Generate AI quiz for a note
```bash
curl -X POST "http://localhost:3000/api/generate-quiz" \
  -H "Content-Type: application/json" \
  -d '{"noteId":"1","content":"Note content","title":"Quiz Title","difficulty":"medium"}'
```

#### GET /api/quizzes
Get all quizzes
```bash
curl -X GET "http://localhost:3000/api/quizzes?limit=10&noteId=1"
```

#### POST /api/quizzes
Get single quiz by ID
```bash
curl -X POST "http://localhost:3000/api/quizzes" \
  -H "Content-Type: application/json" \
  -d '{"quizId":"1"}'
```

#### POST /api/submit-quiz
Submit quiz answers
```bash
curl -X POST "http://localhost:3000/api/submit-quiz" \
  -H "Content-Type: application/json" \
  -d '{"quizId":"1","answers":[0,1,2,0,3]}'
```

### 4. Study History & Analytics

#### GET /api/study-history
Get study history with statistics
```bash
curl -X GET "http://localhost:3000/api/study-history?limit=20&action=quiz"
```

### 5. PDF Text Extraction

#### POST /api/extract-text
Extract text from PDF URL (pdf-parse method)
```bash
curl -X POST "http://localhost:3000/api/extract-text" \
  -H "Content-Type: application/json" \
  -d '{"fileUrl":"https://example.com/file.pdf"}'
```

#### POST /api/extract-text-pdfjs
Extract text from PDF URL (PDF.js method)
```bash
curl -X POST "http://localhost:3000/api/extract-text-pdfjs" \
  -H "Content-Type: application/json" \
  -d '{"fileUrl":"https://example.com/file.pdf"}'
```

### 6. AI Chat Assistant

#### POST /api/ai-openrouter
Chat with AI assistant (Primary - OpenRouter)
```bash
curl -X POST "http://localhost:3000/api/ai-openrouter" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Explain photosynthesis"}'
```

#### POST /api/ai
Chat with AI assistant (Fallback - Hugging Face)
```bash
curl -X POST "http://localhost:3000/api/ai" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Help me understand calculus"}'
```

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## 🗄️ Database Schema

### Tables:
- **notes**: Main notes storage
- **summaries**: AI-generated summaries
- **quizzes**: AI-generated quizzes
- **quiz_attempts**: Quiz submission results
- **study_history**: Activity tracking

## 🔧 Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://...

# AI Services
OPENROUTER_API_KEY=sk-or-v1-...
HUGGINGFACE_API_KEY=hf_...

# File Upload
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
```

## 🚀 Features Implemented

✅ **PDF Upload & Text Extraction** (Multiple methods)
✅ **AI Summary Generation** (OpenRouter/Llama 3.2)
✅ **AI Quiz Generation** (Multiple choice with explanations)
✅ **Quiz Submission & Scoring** (Automatic grading)
✅ **Study History Tracking** (All activities logged)
✅ **Analytics Dashboard** (Statistics & progress)
✅ **AI Chat Assistant** (Study help & Q&A)
✅ **Bengali Language Support** (UI messages)
✅ **Error Handling** (Comprehensive error management)
✅ **Database Integration** (PostgreSQL with Drizzle ORM)

## 🎯 Usage Flow

1. **Upload PDF** → Extract text → Save to database
2. **Generate Summary** → AI processes content → Save summary
3. **Create Quiz** → AI generates questions → Save quiz
4. **Take Quiz** → Submit answers → Get results & feedback
5. **View History** → Track progress → Analytics dashboard
6. **Chat with AI** → Get study help → Personalized assistance

## 🔍 Testing

All APIs are tested and working. The system provides:
- Robust error handling
- Multiple AI service fallbacks
- Comprehensive logging
- Bengali language support
- Real-time progress tracking