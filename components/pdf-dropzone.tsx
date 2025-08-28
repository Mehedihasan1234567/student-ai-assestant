"use client"

import * as React from "react"
import { UploadCloud, FileText, Image, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import { cn } from "@/lib/utils"

type PdfDropzoneProps = {
  onSelect: (file: File) => void
  onUploadComplete?: (result: { fileUrl: string; extractedText: string; fileName: string }) => void
  onUploadError?: (error: string) => void
  className?: string
}

type UploadState = "idle" | "uploading" | "extracting" | "success" | "error"

export function PdfDropzone({ onSelect, onUploadComplete, onUploadError, className }: PdfDropzoneProps) {
  const [dragActive, setDragActive] = React.useState(false)
  const [uploadState, setUploadState] = React.useState<UploadState>("idle")
  const [uploadProgress, setUploadProgress] = React.useState("")
  const [selectedFileName, setSelectedFileName] = React.useState("")
  const [fileType, setFileType] = React.useState<"pdf" | "image" | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name)

    if (isPdf || isImage) {
      setSelectedFileName(file.name)
      setFileType(isPdf ? "pdf" : "image")
      setUploadState("idle")
      setUploadProgress("")
      onSelect(file)
    } else {
      setUploadState("error")
      setUploadProgress("শুধুমাত্র PDF এবং Image ফাইল সাপোর্টেড")
      if (onUploadError) {
        onUploadError("Please upload a PDF or Image file.")
      }
    }
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
  }
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const getStatusIcon = () => {
    switch (uploadState) {
      case "uploading":
      case "extracting":
        return <Loader2 className="h-7 w-7 text-blue-600 dark:text-blue-400 animate-spin" />
      case "success":
        return <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
      case "error":
        return <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
      default:
        return fileType === "image" ?
          <Image className="h-7 w-7 text-sky-600 dark:text-teal-400" /> :
          <UploadCloud className="h-7 w-7 text-sky-600 dark:text-teal-400" />
    }
  }

  const getStatusColor = () => {
    switch (uploadState) {
      case "uploading":
      case "extracting":
        return "bg-blue-500/10 dark:bg-blue-500/10"
      case "success":
        return "bg-green-500/10 dark:bg-green-500/10"
      case "error":
        return "bg-red-500/10 dark:bg-red-500/10"
      default:
        return "bg-sky-500/10 dark:bg-teal-500/10"
    }
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "relative flex min-h-[280px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200",
        "bg-gradient-to-br from-sky-50/60 to-teal-50/60 dark:from-[#0B1220] dark:to-[#0F1B2D]",
        "border-sky-200/70 dark:border-sky-900/40",
        dragActive && "border-sky-400/80 dark:border-teal-400/60 scale-[1.02]",
        uploadState === "success" && "border-green-400/80 dark:border-green-400/60",
        uploadState === "error" && "border-red-400/80 dark:border-red-400/60",
        "shadow-md hover:shadow-lg",
        className,
      )}
      role="region"
      aria-label="Upload PDF notes"
    >
      <input ref={inputRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={onChange} />

      <div className="flex flex-col items-center gap-4">
        {/* Status Icon */}
        <div className={cn(
          "flex h-16 w-16 items-center justify-center rounded-xl shadow-md transition-all duration-200",
          getStatusColor()
        )}>
          {getStatusIcon()}
        </div>

        {/* Main Text */}
        <div className="space-y-2">
          <p className="text-base font-medium text-neutral-800 dark:text-neutral-100">
            {uploadState === "idle" ? "PDF বা Image ফাইল ড্র্যাগ করুন অথবা ক্লিক করুন" :
              uploadState === "uploading" ? "আপলোড হচ্ছে..." :
                uploadState === "extracting" ? "AI দিয়ে টেক্সট এক্সট্রাক্ট করা হচ্ছে..." :
                  uploadState === "success" ? "সফলভাবে সম্পন্ন!" :
                    "আপলোড ব্যর্থ"}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {uploadProgress || "PDF এবং Image ফাইল সাপোর্টেড (সর্বোচ্চ 16MB) - Local AI Processing"}
          </p>
        </div>

        {/* Selected File Info */}
        {selectedFileName && (
          <div className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-neutral-800/50 rounded-lg border">
            {fileType === "image" ?
              <Image className="h-4 w-4 text-blue-600" /> :
              <FileText className="h-4 w-4 text-red-600" />
            }
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {selectedFileName}
            </span>
          </div>
        )}

        {/* Upload Button */}
        <div className="mt-2">
          <UploadButton<OurFileRouter, "notesUploader">
            endpoint="notesUploader"
            onBeforeUploadBegin={(files) => {
              setUploadState("uploading")
              setUploadProgress("ফাইল আপলোড হচ্ছে...")
              return files
            }}
            onClientUploadComplete={async (res) => {
              const fileUrl = res?.[0].url;
              const fileName = res?.[0].name || selectedFileName || "Unknown file";
              console.log("Uploaded file URL:", fileUrl);

              setUploadState("extracting")
              setUploadProgress("Free OCR দিয়ে টেক্সট এক্সট্রাক্ট করা হচ্ছে...")

              try {
                console.log("Using free OCR for text extraction...");

                const response = await fetch("/api/ai", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    fileUrl,
                    type: fileType,
                    prompt: "Extract all text from this document/image and convert it to clean, readable markdown format. Include any tables, lists, headings, and preserve the structure as much as possible."
                  }),
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || "Text extraction failed");
                }

                const data = await response.json();
                console.log("Free OCR response:", data);

                if (data && Array.isArray(data) && data[0]?.generated_text) {
                  const extractedText = data[0].generated_text;

                  if (extractedText && extractedText.trim().length > 10) {
                    console.log(`Text extracted using Free OCR, length: ${extractedText.length}`);
                    setUploadState("success")
                    setUploadProgress(`সফলভাবে সম্পন্ন! ${extractedText.length} অক্ষর এক্সট্রাক্ট করা হয়েছে (Free OCR)`)

                    setTimeout(() => {
                      if (onUploadComplete) {
                        onUploadComplete({
                          fileUrl,
                          extractedText,
                          fileName
                        });
                      }
                    }, 1000); // Small delay to show success state
                  } else {
                    throw new Error("No meaningful text extracted");
                  }
                } else {
                  throw new Error("Invalid response from AI model");
                }

              } catch (error) {
                console.error("Free OCR extraction failed:", error);
                setUploadState("error")
                setUploadProgress("টেক্সট এক্সট্রাকশন ব্যর্থ - সার্ভার সমস্যা")
                if (onUploadError) {
                  onUploadError("Text extraction failed. Please try again in a few moments.");
                }
              }
            }}
            onUploadError={(error) => {
              console.error("Upload failed:", error);
              setUploadState("error")
              setUploadProgress(`আপলোড ব্যর্থ: ${error.message}`)
              if (onUploadError) {
                onUploadError(`Upload failed: ${error.message}`);
              }
            }}
            appearance={{
              button: cn(
                "bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600",
                "text-white font-medium px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200",
                "border-0 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transform hover:scale-105",
                uploadState === "uploading" || uploadState === "extracting"
                  ? "opacity-75 cursor-not-allowed scale-100"
                  : "",
                uploadState === "success" && "bg-gradient-to-r from-green-500 to-emerald-500"
              ),
              allowedContent: "text-xs text-neutral-500 dark:text-neutral-400 mt-2",
              container: "flex flex-col items-center gap-2"
            }}
            content={{
              button: uploadState === "uploading"
                ? "আপলোড হচ্ছে..."
                : uploadState === "extracting"
                  ? "AI প্রসেসিং..."
                  : uploadState === "success"
                    ? "সম্পন্ন!"
                    : "PDF/Image আপলোড করুন",
              allowedContent: "PDF এবং Image (সর্বোচ্চ 16MB)"
            }}
            disabled={uploadState === "uploading" || uploadState === "extracting"}
          />
        </div>

        {/* Progress Indicator */}
        {(uploadState === "uploading" || uploadState === "extracting") && (
          <div className="w-full max-w-xs">
            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}