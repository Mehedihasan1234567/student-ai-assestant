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
      // Try to use pdf-parse with proper error handling
      console.log("Attempting to parse PDF...");
      
      // Create a clean buffer
      const buffer = Buffer.from(fileBuffer);
      
      // Dynamic import with better error handling
      const pdfParse = await import("pdf-parse").then(module => module.default);
      
      // Parse with options to avoid file system issues
      const data = await pdfParse(buffer, {
        // Disable external file dependencies
        max: 0, // Parse all pages
        version: 'v1.10.100' // Specify version to avoid compatibility issues
      });
      
      console.log("PDF parsed successfully, text length:", data.text.length);

      if (!data.text || data.text.trim().length === 0) {
        return NextResponse.json({ 
          error: "No text found in PDF", 
          text: "This PDF appears to be image-based or contains no extractable text." 
        });
      }

      return NextResponse.json({ text: data.text });
      
    } catch (parseError) {
      console.error("PDF parsing error:", parseError);
      
      // Fallback: Return a message indicating the PDF couldn't be parsed
      return NextResponse.json({ 
        text: "Unable to extract text from this PDF. The file may be image-based, corrupted, or in an unsupported format. Please try converting it to a text-based PDF first.",
        error: "PDF parsing failed"
      });
    }

  } catch (err) {
    console.error("Error in extract-text API:", err);
    return NextResponse.json({ 
      error: "Failed to extract text", 
      details: err instanceof Error ? err.message : "Unknown error",
      text: "An error occurred while processing your PDF. Please try again with a different file."
    }, { status: 500 });
  }
}
