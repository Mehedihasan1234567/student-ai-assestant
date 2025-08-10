import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("OCR Extract text API called");

    const { fileUrl } = await req.json();
    console.log("File URL:", fileUrl);

    if (!fileUrl) {
      return NextResponse.json({ error: "File URL is required" }, { status: 400 });
    }

    console.log("Fetching file from URL...");
    const response = await fetch(fileUrl);

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
      // Convert PDF to images and then use OCR
      console.log("Converting PDF to images for OCR...");
      
      // Use PDF.js to render PDF pages as images
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = null;

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(fileBuffer),
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      console.log(`PDF loaded for OCR. Number of pages: ${pdf.numPages}`);

      let fullText = "";
      const maxPages = Math.min(pdf.numPages, 3); // Process max 3 pages for performance

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        console.log(`Processing page ${pageNum} with OCR...`);
        
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR

        // Create canvas
        const canvas = new OffscreenCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error("Could not get canvas context");
        }

        // Render PDF page to canvas
        await page.render({
          canvasContext: context as any,
          viewport: viewport,
        }).promise;

        // Convert canvas to image data
        const imageData = context.getImageData(0, 0, viewport.width, viewport.height);
        
        // Use Tesseract.js for OCR
        const Tesseract = await import("tesseract.js");
        
        console.log(`Running OCR on page ${pageNum}...`);
        const { data: { text } } = await Tesseract.recognize(imageData, 'eng+ben', {
          logger: m => console.log(m)
        });

        fullText += text + "\n\n";
        console.log(`OCR completed for page ${pageNum}, extracted ${text.length} characters`);
      }

      console.log("OCR completed successfully, total text length:", fullText.length);

      if (!fullText || fullText.trim().length === 0) {
        return NextResponse.json({
          text: "OCR could not extract any text from this PDF. The image quality may be too low or the text may be in an unsupported language.",
          error: "No text found via OCR"
        });
      }

      return NextResponse.json({ 
        text: fullText.trim(),
        method: "OCR",
        pagesProcessed: maxPages
      });

    } catch (ocrError) {
      console.error("OCR processing error:", ocrError);

      return NextResponse.json({
        text: "OCR processing failed. This may be due to poor image quality, unsupported text format, or server limitations.",
        error: "OCR processing failed"
      });
    }

  } catch (err) {
    console.error("Error in OCR extract-text API:", err);
    return NextResponse.json({
      error: "Failed to extract text via OCR",
      details: err instanceof Error ? err.message : "Unknown error",
      text: "An error occurred while processing your PDF with OCR. Please try again with a different file."
    }, { status: 500 });
  }
}