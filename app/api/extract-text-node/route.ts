import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("Node-based PDF extract API called");

    const { fileUrl } = await req.json();
    console.log("File URL:", fileUrl);

    if (!fileUrl) {
      return NextResponse.json(
        {
          error: "File URL is required",
          success: false,
          message: "No file URL provided",
        },
        { status: 400 }
      );
    }

    console.log("Fetching file from URL...");
    const response = await fetch(fileUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PDF-Text-Extractor/1.0)",
      },
    });

    if (!response.ok) {
      console.error(
        "Failed to fetch file:",
        response.status,
        response.statusText
      );
      return NextResponse.json(
        {
          error: "Failed to fetch file",
          success: false,
          message: "Could not download the PDF file",
        },
        { status: 400 }
      );
    }

    const fileBuffer = await response.arrayBuffer();
    console.log("File buffer size:", fileBuffer.byteLength);

    if (fileBuffer.byteLength === 0) {
      return NextResponse.json(
        {
          error: "Empty file received",
          success: false,
          message: "The PDF file appears to be empty",
        },
        { status: 400 }
      );
    }

    try {
      // Method 1: Raw PDF text extraction (no dependencies)
      console.log("Trying raw PDF text extraction...");

      const bufferString = Buffer.from(fileBuffer).toString("binary");
      let extractedText = "";

      // Look for text streams in PDF
      const textStreamRegex = /BT\s+(.*?)\s+ET/gs;
      const textMatches = bufferString.match(textStreamRegex);

      if (textMatches && textMatches.length > 0) {
        console.log(`Found ${textMatches.length} text streams`);

        for (const match of textMatches.slice(0, 100)) {
          // Limit to first 100 matches
          // Extract text from PDF text objects
          const parenthesesRegex = /\(([^)]+)\)/g;

          let textMatch;
          while ((textMatch = parenthesesRegex.exec(match)) !== null) {
            const text = textMatch[1];
            if (text && text.length > 1 && !text.match(/^[\d\s\-\.]+$/)) {
              extractedText += text + " ";
            }
          }

          // Also try simpler pattern
          const lines = match.split("\n");
          for (const line of lines) {
            if (line.includes("Tj")) {
              const textParts = line.match(/\(([^)]+)\)/g);
              if (textParts) {
                for (const part of textParts) {
                  const cleanText = part.replace(/[()]/g, "").trim();
                  if (
                    cleanText.length > 2 &&
                    !cleanText.match(/^[\d\s\-\.]+$/)
                  ) {
                    extractedText += cleanText + " ";
                  }
                }
              }
            }
          }
        }
      }

      // Method 2: Look for stream objects
      if (!extractedText || extractedText.length < 50) {
        console.log("Trying stream object extraction...");

        const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
        const streams = bufferString.match(streamRegex);

        if (streams) {
          console.log(`Found ${streams.length} streams`);

          for (const stream of streams.slice(0, 50)) {
            // Look for readable text in streams
            const readableText = stream.match(/[a-zA-Z]{3,}/g);
            if (readableText && readableText.length > 5) {
              extractedText += readableText.join(" ") + " ";
            }
          }
        }
      }

      // Method 3: Direct text search
      if (!extractedText || extractedText.length < 50) {
        console.log("Trying direct text search...");

        // Look for readable text patterns
        const readableTextRegex = /[A-Za-z][A-Za-z\s]{10,}/g;
        const readableMatches = bufferString.match(readableTextRegex);

        if (readableMatches) {
          console.log(`Found ${readableMatches.length} readable text patterns`);

          for (const match of readableMatches.slice(0, 100)) {
            const cleanMatch = match.trim();
            if (cleanMatch.length > 10 && !cleanMatch.match(/^[\d\s\-\.]+$/)) {
              extractedText += cleanMatch + " ";
            }
          }
        }
      }

      // Clean up extracted text
      extractedText = extractedText
        .replace(/\s+/g, " ")
        .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
        .replace(/\\[nrt]/g, " ") // Replace escape sequences
        .trim();

      console.log(
        "Raw extraction completed, text length:",
        extractedText.length
      );

      if (extractedText && extractedText.length > 20) {
        return NextResponse.json({
          text: extractedText,
          success: true,
          method: "Raw-PDF-Extraction",
          extractedLength: extractedText.length,
          debug: {
            bufferSize: fileBuffer.byteLength,
            textStreamsFound: textMatches ? textMatches.length : 0,
          },
        });
      }

      // If raw extraction failed, try alternative approach
      console.log("Raw extraction insufficient, trying alternative...");

      // Method 4: PDF structure analysis
      const pdfVersion = bufferString.match(/%PDF-([\\d\\.]+)/);
      const pageCount = (bufferString.match(/\/Type\/Page/g) || []).length;

      console.log(
        `PDF Version: ${
          pdfVersion ? pdfVersion[1] : "unknown"
        }, Pages: ${pageCount}`
      );

      if (pageCount === 0) {
        return NextResponse.json(
          {
            error: "Invalid PDF structure",
            success: false,
            message: "This file does not appear to be a valid PDF document.",
            debug: {
              bufferSize: fileBuffer.byteLength,
              pdfVersion: pdfVersion ? pdfVersion[1] : "unknown",
              pageCount: pageCount,
            },
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: "No extractable text found",
          success: false,
          message:
            "This PDF appears to be image-based or contains no extractable text. The PDF structure is valid but no readable text was found. Please try: 1) Using a text-based PDF, 2) Converting with Google Drive OCR, 3) Using online PDF to text converters.",
          debug: {
            bufferSize: fileBuffer.byteLength,
            pdfVersion: pdfVersion ? pdfVersion[1] : "unknown",
            pageCount: pageCount,
            extractedLength: extractedText.length,
            extractedSample: extractedText.substring(0, 200),
          },
        },
        { status: 400 }
      );
    } catch (extractError) {
      console.error("PDF text extraction error:", extractError);

      return NextResponse.json(
        {
          error: "PDF extraction failed",
          success: false,
          message:
            "Unable to extract text from this PDF using raw extraction methods. Please try: 1) Using a text-based PDF, 2) Converting with Google Drive OCR, 3) Using a different file.",
          debug: {
            errorMessage: extractError.message,
            bufferSize: fileBuffer.byteLength,
          },
        },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Error in node extract-text API:", err);
    return NextResponse.json(
      {
        error: "Server error",
        success: false,
        message:
          "An unexpected error occurred while processing your PDF. Please try again.",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
