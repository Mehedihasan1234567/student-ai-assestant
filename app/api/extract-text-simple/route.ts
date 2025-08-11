import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("Simple PDF extract API called");
    
    const { fileUrl } = await req.json();
    console.log("File URL:", fileUrl);

    if (!fileUrl) {
      return NextResponse.json({ 
        error: "File URL is required",
        success: false,
        message: "No file URL provided"
      }, { status: 400 });
    }

    console.log("Fetching file from URL...");
    const response = await fetch(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PDF-Text-Extractor/1.0)',
      },
    });
    
    if (!response.ok) {
      console.error("Failed to fetch file:", response.status, response.statusText);
      return NextResponse.json({ 
        error: "Failed to fetch file",
        success: false,
        message: "Could not download the PDF file"
      }, { status: 400 });
    }

    const fileBuffer = await response.arrayBuffer();
    console.log("File buffer size:", fileBuffer.byteLength);

    if (fileBuffer.byteLength === 0) {
      return NextResponse.json({ 
        error: "Empty file received",
        success: false,
        message: "The PDF file appears to be empty"
      }, { status: 400 });
    }

    try {
      // Use PDF.js for text extraction (more reliable in serverless)
      console.log("Using PDF.js for text extraction...");
      const pdfjsLib = await import("pdfjs-dist");

      // Configure for serverless environment
      if (typeof pdfjsLib.GlobalWorkerOptions !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      }

      console.log("Loading PDF document...");
      
      // Polyfill DOMMatrix for serverless environment
      if (typeof globalThis.DOMMatrix === 'undefined') {
        globalThis.DOMMatrix = class DOMMatrix {
          constructor(init) {
            if (Array.isArray(init)) {
              this.a = init[0] || 1;
              this.b = init[1] || 0;
              this.c = init[2] || 0;
              this.d = init[3] || 1;
              this.e = init[4] || 0;
              this.f = init[5] || 0;
            } else {
              this.a = 1;
              this.b = 0;
              this.c = 0;
              this.d = 1;
              this.e = 0;
              this.f = 0;
            }
          }
          
          multiply(other) {
            return new DOMMatrix([
              this.a * other.a + this.c * other.b,
              this.b * other.a + this.d * other.b,
              this.a * other.c + this.c * other.d,
              this.b * other.c + this.d * other.d,
              this.a * other.e + this.c * other.f + this.e,
              this.b * other.e + this.d * other.f + this.f
            ]);
          }
          
          translate(x, y) {
            return new DOMMatrix([this.a, this.b, this.c, this.d, this.e + x, this.f + y]);
          }
          
          scale(x, y = x) {
            return new DOMMatrix([this.a * x, this.b * x, this.c * y, this.d * y, this.e, this.f]);
          }
        };
      }

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(fileBuffer),
        useSystemFonts: true,
        disableFontFace: true, // Disable font loading for serverless
        verbosity: 0, // Reduce logging
        isEvalSupported: false, // Disable eval for security
        useWorkerFetch: false, // Disable worker fetch
      });

      const pdf = await loadingTask.promise;
      console.log(`PDF loaded successfully. Pages: ${pdf.numPages}`);

      let fullText = "";
      let debugInfo = [];
      const maxPages = Math.min(pdf.numPages, 20); // Limit pages for performance

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          console.log(`Processing page ${pageNum}/${maxPages}...`);
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();

          console.log(`Page ${pageNum} has ${textContent.items.length} text items`);
          debugInfo.push(`Page ${pageNum}: ${textContent.items.length} items`);

          const pageText = textContent.items
            .map((item: any) => {
              if (item && typeof item.str === 'string') {
                return item.str;
              }
              return '';
            })
            .filter(text => text.trim().length > 0)
            .join(' ');

          console.log(`Page ${pageNum} extracted text length: ${pageText.length}`);
          debugInfo.push(`Page ${pageNum} text length: ${pageText.length}`);

          if (pageText.trim()) {
            fullText += pageText + '\n\n';
          }
        } catch (pageError) {
          console.warn(`Error processing page ${pageNum}:`, pageError);
          debugInfo.push(`Page ${pageNum} error: ${pageError.message}`);
          // Continue with other pages
        }
      }

      console.log("Text extraction completed, total length:", fullText.length);
      console.log("Debug info:", debugInfo);

      if (!fullText || fullText.trim().length === 0) {
        return NextResponse.json({
          error: "No text found",
          success: false,
          message: "This PDF appears to be image-based or contains no extractable text. Try using a text-based PDF or OCR tools.",
          debug: {
            totalPages: pdf.numPages,
            processedPages: maxPages,
            debugInfo: debugInfo,
            bufferSize: fileBuffer.byteLength
          }
        }, { status: 400 });
      }

      // Clean up the text
      const cleanText = fullText
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n\n') // Clean up line breaks
        .trim();

      return NextResponse.json({ 
        text: cleanText,
        success: true,
        method: "PDF.js-Simple",
        pages: maxPages,
        totalPages: pdf.numPages,
        debug: {
          debugInfo: debugInfo,
          originalLength: fullText.length,
          cleanedLength: cleanText.length
        }
      });
      
    } catch (extractError) {
      console.error("PDF text extraction error:", extractError);
      
      return NextResponse.json({
        error: "PDF extraction failed",
        success: false,
        message: "Unable to extract text from this PDF. The file may be image-based, corrupted, or in an unsupported format. Please try: 1) Using a text-based PDF, 2) Converting with Google Drive OCR, 3) Using a different file.",
        debug: {
          errorMessage: extractError.message,
          errorStack: extractError.stack,
          bufferSize: fileBuffer.byteLength
        }
      }, { status: 400 });
    }

  } catch (err) {
    console.error("Error in simple extract-text API:", err);
    return NextResponse.json({ 
      error: "Server error",
      success: false,
      message: "An unexpected error occurred while processing your PDF. Please try again.",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}