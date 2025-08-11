import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("Extract text API called");
    
    const { fileUrl } = await req.json();
    console.log("File URL:", fileUrl);

    if (!fileUrl) {
      return NextResponse.json({ error: "File URL is required" }, { status: 400 });
    }

    console.log("Fetching file from URL...");
    const response = await fetch(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PDF-Text-Extractor/1.0)',
      },
    });
    
    if (!response.ok) {
      console.error("Failed to fetch file:", response.status, response.statusText);
      return NextResponse.json({ error: "Failed to fetch file" }, { status: 400 });
    }

    const fileBuffer = await response.arrayBuffer();
    console.log("File buffer size:", fileBuffer.byteLength);

    if (fileBuffer.byteLength === 0) {
      return NextResponse.json({ error: "Empty file received" }, { status: 400 });
    }

    try {
      // Skip pdf-parse due to serverless compatibility issues
      // Redirect to PDF.js method which is more reliable
      console.log("Redirecting to PDF.js method for better serverless compatibility...");
      
      const pdfJsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/extract-text-pdfjs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });

      const pdfJsData = await pdfJsResponse.json();
      
      if (pdfJsData.success) {
        return NextResponse.json({
          text: pdfJsData.text,
          success: true,
          method: "PDF.js (via redirect)"
        });
      } else {
        return NextResponse.json({
          error: "PDF parsing failed",
          success: false,
          message: pdfJsData.message || "Unable to extract text from this PDF."
        }, { status: 400 });
      }
      
    } catch (parseError) {
      console.error("PDF parsing error:", parseError);
      
      // Fallback: Return proper error response
      return NextResponse.json({ 
        error: "PDF parsing failed",
        success: false,
        message: "Unable to extract text from this PDF. The file may be image-based, corrupted, or in an unsupported format. Please try converting it to a text-based PDF first."
      }, { status: 400 });
    }

  } catch (err) {
    console.error("Error in extract-text API:", err);
    return NextResponse.json({ 
      error: "Failed to extract text", 
      success: false,
      message: "An error occurred while processing your PDF. Please try again with a different file.",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}
