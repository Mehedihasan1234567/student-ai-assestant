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
      // Use PDF.js for more reliable parsing
      const pdfjsLib = await import("pdfjs-dist");

      // Disable worker for serverless environment
      pdfjsLib.GlobalWorkerOptions.workerSrc = null;

      console.log("Loading PDF document...");
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(fileBuffer),
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      console.log(`PDF loaded. Number of pages: ${pdf.numPages}`);

      let fullText = "";

      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`Processing page ${pageNum}...`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");

        fullText += pageText + "\n\n";
      }

      console.log("PDF parsed successfully, text length:", fullText.length);

      if (!fullText || fullText.trim().length === 0) {
        return NextResponse.json({
          text: "This PDF appears to be image-based or contains no extractable text.",
          error: "No text found",
        });
      }

      return NextResponse.json({ text: fullText.trim() });
    } catch (parseError) {
      console.error("PDF.js parsing error:", parseError);

      return NextResponse.json({
        text: "Unable to extract text from this PDF using PDF.js. The file may be corrupted or in an unsupported format.",
        error: "PDF.js parsing failed",
      });
    }
  } catch (err) {
    console.error("Error in PDF.js extract-text API:", err);
    return NextResponse.json(
      {
        error: "Failed to extract text",
        details: err instanceof Error ? err.message : "Unknown error",
        text: "An error occurred while processing your PDF with PDF.js. Please try again.",
      },
      { status: 500 }
    );
  }
}
