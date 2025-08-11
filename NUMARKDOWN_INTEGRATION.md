# NuMarkdown-8B-Thinking Integration

## Overview
This project has been updated to use the **numind/NuMarkdown-8B-Thinking** model from Hugging Face for AI-powered text extraction and generation.

## Changes Made

### 1. Updated AI API (`app/api/ai/route.ts`)
- **Model**: Changed from `openai/gpt-oss-120b` to `numind/NuMarkdown-8B-Thinking`
- **New Features**:
  - Support for both text prompts and image/PDF processing
  - Image-to-text conversion using vision capabilities
  - Base64 image encoding for API requests
  - Better error handling for model loading states

### 2. Enhanced PDF Dropzone (`components/pdf-dropzone.tsx`)
- **File Support**: Now accepts both PDF and image files (`application/pdf,image/*`)
- **AI Integration**: Uses NuMarkdown-8B-Thinking for text extraction instead of traditional PDF parsing
- **UI Updates**: 
  - Updated icons and messages to reflect image support
  - Progress indicators show AI processing status
  - Better error messages for unsupported files

### 3. Updated Generation APIs
- **Summary API** (`app/api/generate-summary/route.ts`): Now uses numind/NuMarkdown-8B-Thinking instead of OpenRouter
- **Quiz API** (`app/api/generate-quiz/route.ts`): Now uses numind/NuMarkdown-8B-Thinking instead of OpenRouter

### 4. Test Page
- **New Test Page** (`app/test-numarkdown/page.tsx`): 
  - Test both text generation and image-to-text conversion
  - Sample test cases for validation
  - Real-time API testing interface

## Supported File Types

### Images
- JPG, JPEG, PNG, GIF, BMP, WebP
- Screenshots and scanned documents
- Handwritten notes (clear quality)

### PDFs
- Text-based PDFs
- Image-based/scanned PDFs (using AI OCR)
- Complex layouts with tables and formatting
- Academic papers and books

## API Usage

### Text Generation
```javascript
const response = await fetch("/api/ai", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: "Your text prompt here"
  }),
});
```

### Image/PDF to Text
```javascript
const response = await fetch("/api/ai", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    fileUrl: "https://example.com/document.pdf",
    type: "pdf", // or "image"
    prompt: "Extract all text and convert to markdown"
  }),
});
```

## Environment Variables
Make sure you have the Hugging Face API key set:
```
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

## Benefits of numind/NuMarkdown-8B-Thinking

1. **Vision Capabilities**: Can process both text and images
2. **OCR Support**: Handles scanned documents and handwritten notes
3. **Markdown Output**: Preserves formatting and structure
4. **Multi-modal**: Single model for all text processing needs
5. **Better Accuracy**: Advanced AI model with improved text extraction
6. **Specialized Model**: Specifically designed for markdown and document processing

## Testing
Visit `/test-numarkdown` to test the new AI integration with sample prompts and images.

## Migration Notes
- Old PDF extraction methods have been replaced with AI-powered extraction
- The system now supports image uploads in addition to PDFs
- All text generation now uses the same NuMarkdown-8B-Thinking model for consistency
- Error handling includes model loading states (503 errors)