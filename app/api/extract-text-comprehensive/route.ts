import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("Comprehensive PDF Extract text API called");

    const { fileUrl } = await req.json();
    console.log("File URL:", fileUrl);

    if (!fileUrl) {
      return NextResponse.json({ 
        error: "File URL is required",
        success: false 
      }, { status: 400 });
    }

    console.log("Fetching file from URL...");
    const response = await fetch(fileUrl);

    if (!response.ok) {
      console.error("Failed to fetch file:", response.status, response.statusText);
      return NextResponse.json({ 
        error: "Failed to fetch file",
        success: false 
      }, { status: 400 });
    }

    const fileBuffer = await response.arrayBuffer();
    console.log("File buffer size:", fileBuffer.byteLength);

    if (fileBuffer.byteLength === 0) {
      return NextResponse.json({ 
        error: "Empty file received",
        success: false 
      }, { status: 400 });
    }

    // Method 1: Simple PDF.js (Most reliable for serverless)
    try {
      console.log("Trying Method 1: Simple PDF.js extraction...");
      
      const pdfjsLib = await import("pdfjs-dist");
      
      // Serverless-optimized configuration
      pdfjsLib.GlobalWorkerOptions.workerSrc = '';

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(fileBuffer),
        useSystemFonts: true,
        disableFontFace: true,
        verbosity: 0,
      });

      const pdf = await loadingTask.promise;
      console.log(`PDF loaded. Number of pages: ${pdf.numPages}`);

      let fullText = "";
      const maxPages = Math.min(pdf.numPages, 20);

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          if (pageText.trim()) {
            fullText += pageText + '\n\n';
          }
          
          console.log(`Page ${pageNum} processed, extracted ${pageText.length} characters`);
        } catch (pageError) {
          console.error(`Error processing page ${pageNum}:`, pageError);
          continue;
        }
      }

      // Clean up the text
      fullText = fullText
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();

      if (fullText && fullText.length > 10) {
        console.log("Method 1 successful, total text length:", fullText.length);
        return NextResponse.json({ 
          success: true,
          text: fullText,
          method: "PDF.js-Simple",
          pagesProcessed: maxPages,
          message: "Text extracted successfully using simple PDF.js method"
        });
      } else {
        throw new Error("Insufficient text extracted");
      }

    } catch (method1Error) {
      console.log("Method 1 failed:", method1Error);
    }

    // Method 2: Advanced PDF.js with detailed text extraction
    try {
      console.log("Trying Method 2: Advanced PDF.js extraction...");
      
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = '';

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(fileBuffer),
        useSystemFonts: true,
        disableFontFace: false,
        verbosity: 0,
      });

      const pdf = await loadingTask.promise;
      let fullText = "";
      const maxPages = Math.min(pdf.numPages, 15);

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // Advanced text extraction with positioning
          let pageText = "";
          let lastY = -1;
          
          for (const item of textContent.items) {
            const textItem = item as any;
            
            // Add line breaks based on Y position changes
            if (lastY !== -1 && Math.abs(textItem.transform[5] - lastY) > 5) {
              pageText += '\n';
            }
            
            pageText += textItem.str + ' ';
            lastY = textItem.transform[5];
          }
          
          if (pageText.trim()) {
            fullText += pageText.trim() + '\n\n';
          }
          
          console.log(`Advanced page ${pageNum} processed`);
        } catch (pageError) {
          console.error(`Error in advanced processing page ${pageNum}:`, pageError);
          continue;
        }
      }

      // Clean up the text
      fullText = fullText
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();

      if (fullText && fullText.length > 10) {
        console.log("Method 2 successful, total text length:", fullText.length);
        return NextResponse.json({ 
          success: true,
          text: fullText,
          method: "PDF.js-Advanced",
          pagesProcessed: maxPages,
          message: "Text extracted successfully using advanced PDF.js method"
        });
      } else {
        throw new Error("Advanced method also failed");
      }

    } catch (method2Error) {
      console.log("Method 2 failed:", method2Error);
    }

    // Method 3: Raw PDF analysis (last resort)
    try {
      console.log("Trying Method 3: Raw PDF analysis...");
      
      const bufferString = Buffer.from(fileBuffer).toString('binary');
      
      // Look for text streams in PDF
      const textMatches = bufferString.match(/BT\s+.*?ET/gs);
      let extractedText = "";
      
      if (textMatches) {
        for (const match of textMatches.slice(0, 50)) { // Limit to first 50 matches
          // Extract text from PDF text objects
          const textContent = match.match(/\((.*?)\)/g);
          if (textContent) {
            for (const text of textContent) {
              const cleanText = text.replace(/[()]/g, '').trim();
              if (cleanText.length > 2) {
                extractedText += cleanText + ' ';
              }
            }
          }
        }
      }
      
      extractedText = extractedText.trim();
      
      if (extractedText && extractedText.length > 20) {
        console.log("Method 3 successful, extracted text length:", extractedText.length);
        return NextResponse.json({ 
          success: true,
          text: extractedText,
          method: "Raw-PDF-Analysis",
          message: "Text extracted using raw PDF analysis method"
        });
      } else {
        throw new Error("Raw analysis insufficient");
      }

    } catch (method3Error) {
      console.log("Method 3 failed:", method3Error);
    }

    // All methods failed
    console.log("All extraction methods failed");
    return NextResponse.json({
      success: false,
      error: "PDF text extraction failed",
      message: "Unable to extract text from this PDF using any available method. The PDF may be: 1) Image-based (scanned document), 2) Password protected, 3) Corrupted, or 4) In an unsupported format. Please try: 1) Using a text-based PDF, 2) Converting with Google Drive OCR, 3) Using a different file.",
      text: "",
      methodsAttempted: ["PDF.js-Simple", "PDF.js-Advanced", "Raw-PDF-Analysis"],
      suggestions: [
        "Use a text-based PDF instead of scanned/image PDF",
        "Convert your PDF using Google Drive OCR",
        "Try online PDF to text converters",
        "Ensure the PDF is not password protected",
        "Check if the PDF file is corrupted"
      ]
    });

  } catch (err) {
    console.error("Error in comprehensive extract-text API:", err);
    return NextResponse.json({
      success: false,
      error: "Failed to extract text from PDF",
      message: "An unexpected error occurred while processing your PDF. Please try again with a different file.",
      details: err instanceof Error ? err.message : "Unknown error",
      text: ""
    }, { status: 500 });
  }
}