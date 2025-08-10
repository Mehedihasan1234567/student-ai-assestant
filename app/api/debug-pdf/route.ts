import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("PDF Debug API called");

    const { fileUrl } = await req.json();
    console.log("File URL:", fileUrl);

    if (!fileUrl) {
      return NextResponse.json({ error: "File URL is required" }, { status: 400 });
    }

    // Fetch the file and analyze it
    console.log("Fetching file from URL...");
    const response = await fetch(fileUrl);

    if (!response.ok) {
      return NextResponse.json({
        error: "Failed to fetch file",
        details: `HTTP ${response.status}: ${response.statusText}`
      }, { status: 400 });
    }

    const fileBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);
    
    console.log("File buffer size:", fileBuffer.byteLength);

    // Basic PDF file analysis
    const analysis = {
      fileSize: fileBuffer.byteLength,
      fileSizeFormatted: formatBytes(fileBuffer.byteLength),
      isPDF: false,
      pdfVersion: null,
      hasTextContent: false,
      isImageBased: false,
      pageCount: 0,
      extractionMethods: {
        pdfParse: { success: false, error: null, textLength: 0 },
        pdfjs: { success: false, error: null, textLength: 0 }
      }
    };

    // Check if it's a valid PDF
    const pdfHeader = buffer.toString('ascii', 0, 8);
    analysis.isPDF = pdfHeader.startsWith('%PDF-');
    
    if (analysis.isPDF) {
      analysis.pdfVersion = pdfHeader.substring(5, 8);
    }

    // Try pdf-parse method
    try {
      console.log("Testing pdf-parse method...");
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      
      analysis.extractionMethods.pdfParse.success = true;
      analysis.extractionMethods.pdfParse.textLength = data.text.length;
      analysis.pageCount = data.numpages;
      analysis.hasTextContent = data.text.trim().length > 0;
      
      console.log("pdf-parse successful:", data.text.length, "characters");
    } catch (error) {
      analysis.extractionMethods.pdfParse.error = error instanceof Error ? error.message : "Unknown error";
      console.log("pdf-parse failed:", analysis.extractionMethods.pdfParse.error);
    }

    // Try PDF.js method
    try {
      console.log("Testing PDF.js method...");
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = null;

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(fileBuffer),
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      analysis.pageCount = pdf.numPages;

      let fullText = "";
      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 3); pageNum++) { // Test first 3 pages only
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + " ";
      }

      analysis.extractionMethods.pdfjs.success = true;
      analysis.extractionMethods.pdfjs.textLength = fullText.length;
      analysis.hasTextContent = analysis.hasTextContent || fullText.trim().length > 0;
      
      console.log("PDF.js successful:", fullText.length, "characters");
    } catch (error) {
      analysis.extractionMethods.pdfjs.error = error instanceof Error ? error.message : "Unknown error";
      console.log("PDF.js failed:", analysis.extractionMethods.pdfjs.error);
    }

    // Determine if it's image-based
    analysis.isImageBased = analysis.isPDF && !analysis.hasTextContent;

    // Recommendations
    const recommendations = [];
    
    if (!analysis.isPDF) {
      recommendations.push("ফাইলটি valid PDF নয়। অনুগ্রহ করে একটি সঠিক PDF ফাইল আপলোড করুন।");
    } else if (analysis.isImageBased) {
      recommendations.push("এই PDF টি image-based। OCR (Optical Character Recognition) প্রয়োজন।");
      recommendations.push("Text-based PDF ব্যবহার করুন অথবা OCR service ব্যবহার করুন।");
    } else if (!analysis.extractionMethods.pdfParse.success && !analysis.extractionMethods.pdfjs.success) {
      recommendations.push("PDF corrupted হতে পারে। অন্য একটি PDF দিয়ে চেষ্টা করুন।");
    } else if (analysis.hasTextContent) {
      recommendations.push("PDF থেকে text extract করা সম্ভব!");
    }

    return NextResponse.json({
      success: true,
      analysis,
      recommendations
    });

  } catch (error) {
    console.error("Error in PDF debug API:", error);
    return NextResponse.json({
      error: "Failed to analyze PDF",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}