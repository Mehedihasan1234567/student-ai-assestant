import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("PDF.js Extract text API called");

    const { fileUrl } = await req.json();
    console.log("File URL:", fileUrl);

    if (!fileUrl) {
      return NextResponse.json(
        { error: "File URL is required" },
        { status: 400 }
      );
    }

    console.log("Fetching file from URL...");
    const response = await fetch(fileUrl);

    if (!response.ok) {
      console.error(
        "Failed to fetch file:",
        response.status,
        response.statusText
      );
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 400 }
      );
    }

    const fileBuffer = await response.arrayBuffer();
    console.log("File buffer size:", fileBuffer.byteLength);

    if (fileBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: "Empty file received" },
        { status: 400 }
      );
    }

    try {
      // Try pdf-parse first as it's more reliable for text-based PDFs
      console.log("Trying pdf-parse method first...");
      try {
        const pdfParse = (await import("pdf-parse")).default;
        const buffer = Buffer.from(fileBuffer);
        const data = await pdfParse(buffer);
        
        if (data.text && data.text.trim().length > 0) {
          console.log("pdf-parse successful, text length:", data.text.length);
          return NextResponse.json({ 
            text: data.text.trim(),
            method: "pdf-parse",
            pages: data.numpages 
          });
        }
      } catch (pdfParseError) {
        console.log("pdf-parse failed, trying PDF.js...", pdfParseError);
      }

      // Fallback to PDF.js
      console.log("Using PDF.js as fallback...");
      const pdfjsLib = await import("pdfjs-dist");

      // Disable worker for serverless environment
      if (typeof pdfjsLib.GlobalWorkerOptions !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      }

      console.log("Loading PDF document...");
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(fileBuffer),
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      console.log(`PDF loaded. Number of pages: ${pdf.numPages}`);

      let fullText = "";

      // Extract text from all pages (limit to first 10 for performance)
      const maxPages = Math.min(pdf.numPages, 10);
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        console.log(`Processing page ${pageNum}...`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");

        fullText += pageText + "\n\n";
      }

      console.log("PDF.js completed, text length:", fullText.length);

      if (!fullText || fullText.trim().length === 0) {
        return NextResponse.json({
          error: "No text found",
          success: false,
          message: "This PDF appears to be image-based or contains no extractable text. Try using a text-based PDF or OCR tools."
        }, { status: 400 });
      }

      return NextResponse.json({ 
        text: fullText.trim(),
        success: true,
        method: "PDF.js",
        pages: maxPages 
      });
    } catch (parseError) {
      console.error("Both PDF parsing methods failed:", parseError);

      return NextResponse.json({
        error: "PDF parsing failed",
        success: false,
        message: "Unable to extract text from this PDF. The file may be image-based, corrupted, or in an unsupported format. Please try: 1) Using a text-based PDF, 2) Converting with Google Drive OCR, 3) Using a different file."
      }, { status: 400 });
    }
  } catch (err) {
    console.error("Error in PDF.js extract-text API:", err);
    return NextResponse.json(
      {
        error: "Failed to extract text",
        success: false,
        message: "An error occurred while processing your PDF with PDF.js. Please try again.",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
