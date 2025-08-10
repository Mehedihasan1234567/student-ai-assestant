import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    guide: {
      title: "PDF Text Extraction Guide",
      supportedTypes: [
        {
          type: "Text-based PDFs",
          description: "PDFs created from Word, Google Docs, or other text editors",
          compatibility: "✅ Excellent",
          examples: ["Academic papers", "eBooks", "Reports", "Presentations"]
        },
        {
          type: "Mixed Content PDFs", 
          description: "PDFs with both text and images",
          compatibility: "🟡 Good",
          examples: ["Textbooks with diagrams", "Research papers with charts"]
        },
        {
          type: "Image-based PDFs",
          description: "Scanned documents or images saved as PDF",
          compatibility: "❌ Not Supported",
          examples: ["Scanned books", "Screenshots", "Photo documents"],
          solution: "Use OCR tools or text-based alternatives"
        }
      ],
      troubleshooting: [
        {
          problem: "Cannot extract text",
          causes: ["Image-based PDF", "Corrupted file", "Protected PDF"],
          solutions: [
            "Try a text-based PDF instead",
            "Use Google Drive OCR: Upload → Open with Google Docs",
            "Check if you can select/copy text manually",
            "Re-download the file if corrupted"
          ]
        },
        {
          problem: "File too large",
          causes: ["PDF over 16MB"],
          solutions: [
            "Compress the PDF using online tools",
            "Split large documents into smaller parts",
            "Remove unnecessary images/pages"
          ]
        }
      ],
      recommendations: [
        "📚 Use PDFs from academic databases and official sources",
        "📝 Export documents as PDF from original applications",
        "🔍 Test by trying to select text in a PDF viewer",
        "💾 Keep file sizes under 16MB for best performance",
        "🌐 Use Google Drive OCR for scanned documents"
      ]
    }
  });
}

export async function POST(req: Request) {
  try {
    const { issue, pdfType } = await req.json();
    
    const solutions = {
      "image-based": {
        title: "Image-based PDF সমাধান",
        steps: [
          "Google Drive এ PDF upload করুন",
          "Right-click → 'Open with Google Docs'",
          "Google Docs এ text convert হবে",
          "File → Download → PDF format এ save করুন",
          "নতুন PDF StudyMate এ upload করুন"
        ],
        alternatives: [
          "Adobe Acrobat এর OCR feature ব্যবহার করুন",
          "Online OCR tools ব্যবহার করুন",
          "Original source থেকে text-based PDF নিন"
        ]
      },
      "corrupted": {
        title: "Corrupted PDF সমাধান", 
        steps: [
          "ফাইলটি re-download করুন",
          "অন্য browser বা device থেকে download করুন",
          "Original source চেক করুন",
          "PDF viewer এ open করে দেখুন"
        ]
      },
      "protected": {
        title: "Protected PDF সমাধান",
        steps: [
          "Password remove করুন যদি জানেন",
          "Original unprotected version খুঁজুন",
          "Author এর কাছ থেকে unprotected copy নিন"
        ]
      },
      "large-file": {
        title: "Large File সমাধান",
        steps: [
          "PDF compressor tool ব্যবহার করুন",
          "Unnecessary pages remove করুন", 
          "Image quality reduce করুন",
          "Document কে parts এ ভাগ করুন"
        ]
      }
    };

    const solution = solutions[issue as keyof typeof solutions] || {
      title: "সাধারণ সমাধান",
      steps: [
        "Text-based PDF ব্যবহার করুন",
        "File size 16MB এর কম রাখুন",
        "PDF manually open করে text select করার চেষ্টা করুন",
        "অন্য PDF দিয়ে test করুন"
      ]
    };

    return NextResponse.json({
      success: true,
      solution
    });

  } catch (error) {
    return NextResponse.json({
      error: "Failed to get solution",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}