import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("Google Docs PDF extract API called");
    
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
      // Google Docs PDFs are usually well-structured, try multiple approaches
      console.log("Analyzing Google Docs PDF structure...");
      
      const bufferString = Buffer.from(fileBuffer).toString('binary');
      let extractedText = "";
      
      // Method 1: Look for uncompressed text streams (common in Google Docs PDFs)
      console.log("Method 1: Looking for uncompressed text streams...");
      const textStreamRegex = /BT\s+([\s\S]*?)\s+ET/g;
      let match;
      let streamCount = 0;
      
      while ((match = textStreamRegex.exec(bufferString)) !== null && streamCount < 100) {
        streamCount++;
        const streamContent = match[1];
        
        // Look for text in parentheses (PDF text objects)
        const textRegex = /\(([^)]+)\)/g;
        let textMatch;
        
        while ((textMatch = textRegex.exec(streamContent)) !== null) {
          const text = textMatch[1];
          // Filter out non-text content
          if (text && text.length > 1 && /[a-zA-Z]/.test(text)) {
            extractedText += text + " ";
          }
        }
        
        // Also look for Tj commands (show text)
        const tjRegex = /([\w\s]+)\s+Tj/g;
        let tjMatch;
        
        while ((tjMatch = tjRegex.exec(streamContent)) !== null) {
          const text = tjMatch[1].trim();
          if (text && text.length > 2 && /[a-zA-Z]/.test(text)) {
            extractedText += text + " ";
          }
        }
      }
      
      console.log(`Method 1 found ${streamCount} text streams, extracted ${extractedText.length} characters`);
      
      // Method 2: Look for font and text definitions (Google Docs specific)
      if (!extractedText || extractedText.length < 50) {
        console.log("Method 2: Looking for font definitions and text...");
        
        // Google Docs often embeds text in font definitions
        const fontRegex = /\/F\d+\s+([\d\.]+)\s+Tf\s*\(([^)]+)\)/g;
        let fontMatch;
        
        while ((fontMatch = fontRegex.exec(bufferString)) !== null) {
          const text = fontMatch[2];
          if (text && text.length > 1 && /[a-zA-Z]/.test(text)) {
            extractedText += text + " ";
          }
        }
        
        // Also look for direct text references
        const directTextRegex = /\d+\s+\d+\s+m\s*\(([^)]+)\)/g;
        let directMatch;
        
        while ((directMatch = directTextRegex.exec(bufferString)) !== null) {
          const text = directMatch[1];
          if (text && text.length > 2 && /[a-zA-Z]/.test(text)) {
            extractedText += text + " ";
          }
        }
      }
      
      console.log(`Method 2 completed, total extracted ${extractedText.length} characters`);
      
      // Method 3: Look for readable text patterns in the entire document
      if (!extractedText || extractedText.length < 50) {
        console.log("Method 3: Looking for readable text patterns...");
        
        // Find sequences of readable text
        const readableRegex = /[A-Za-z][A-Za-z\s.,!?;:]{5,}/g;
        const readableMatches = bufferString.match(readableRegex);
        
        if (readableMatches) {
          console.log(`Found ${readableMatches.length} readable text patterns`);
          
          for (const match of readableMatches.slice(0, 200)) {
            const cleanText = match.trim();
            // Filter out PDF commands and metadata
            if (cleanText.length > 5 && 
                !cleanText.includes('/') && 
                !cleanText.includes('obj') &&
                !cleanText.includes('endobj') &&
                !/^[\\d\\s\\.]+$/.test(cleanText)) {
              extractedText += cleanText + " ";
            }
          }
        }
      }
      
      console.log(`Method 3 completed, total extracted ${extractedText.length} characters`);
      
      // Clean up the extracted text
      extractedText = extractedText
        .replace(/\s+/g, ' ')
        .replace(/[\x00-\x1F\x7F]/g, '')
        .replace(/\\[nrt]/g, ' ')
        .trim();
      
      console.log(`Final cleanup completed, final length: ${extractedText.length}`);
      
      if (extractedText && extractedText.length > 20) {
        return NextResponse.json({ 
          text: extractedText,
          success: true,
          method: "Google-Docs-PDF-Extraction",
          extractedLength: extractedText.length,
          debug: {
            bufferSize: fileBuffer.byteLength,
            textStreamsFound: streamCount,
            methods: ["Text Streams", "Font Definitions", "Readable Patterns"]
          }
        });
      }
      
      // If all methods failed, provide detailed analysis
      console.log("All extraction methods failed, analyzing PDF structure...");
      
      const pdfVersion = bufferString.match(/%PDF-([\\d\\.]+)/);
      const pageCount = (bufferString.match(/\/Type\/Page/g) || []).length;
      const hasImages = bufferString.includes('/Image');
      const hasText = bufferString.includes('/Text');
      const isCompressed = bufferString.includes('/FlateDecode') || bufferString.includes('/Filter');
      
      return NextResponse.json({
        error: "No extractable text found",
        success: false,
        message: `This PDF appears to be ${isCompressed ? 'compressed' : 'uncompressed'} and ${hasImages ? 'contains images' : 'text-only'}. ${hasText ? 'Text objects were detected but could not be extracted.' : 'No text objects were found.'} Please try: 1) Re-exporting from Google Docs as PDF, 2) Using 'File > Download > Plain Text' from Google Docs instead, 3) Converting with Google Drive OCR.`,
        debug: {
          bufferSize: fileBuffer.byteLength,
          pdfVersion: pdfVersion ? pdfVersion[1] : 'unknown',
          pageCount: pageCount,
          hasImages: hasImages,
          hasText: hasText,
          isCompressed: isCompressed,
          extractedLength: extractedText.length,
          extractedSample: extractedText.substring(0, 200),
          textStreamsFound: streamCount
        }
      }, { status: 400 });
      
    } catch (extractError) {
      console.error("PDF text extraction error:", extractError);
      
      return NextResponse.json({
        error: "PDF extraction failed",
        success: false,
        message: "Unable to extract text from this Google Docs PDF. Please try: 1) Re-exporting the PDF from Google Docs, 2) Using 'File > Download > Plain Text' instead, 3) Converting with Google Drive OCR.",
        debug: {
          errorMessage: extractError.message,
          bufferSize: fileBuffer.byteLength
        }
      }, { status: 400 });
    }

  } catch (err) {
    console.error("Error in Google Docs extract-text API:", err);
    return NextResponse.json({ 
      error: "Server error",
      success: false,
      message: "An unexpected error occurred while processing your Google Docs PDF. Please try again.",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}