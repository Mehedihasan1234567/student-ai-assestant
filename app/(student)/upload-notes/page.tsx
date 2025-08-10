"use client"

import * as React from "react"
import { Calendar, FileText, CheckCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PdfDropzone } from "@/components/pdf-dropzone"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

type UploadRecord = {
  id: string
  name: string
  size: number
  dateISO: string
  extractedText?: string
  fileUrl?: string
}

export default function UploadNotesPage() {
  const { toast } = useToast()
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [extractedText, setExtractedText] = React.useState<string>("")
  const [uploadResult, setUploadResult] = React.useState<any>(null)
  const [recent, setRecent] = React.useState<UploadRecord[]>([])
  const [isUploading, setIsUploading] = React.useState(false)

  React.useEffect(() => {
    const raw = localStorage.getItem("recentUploads") || "[]"
    try {
      const arr: UploadRecord[] = JSON.parse(raw)
      const sorted = [...arr].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))
      setRecent(sorted.slice(0, 3))
    } catch {
      setRecent([])
    }
  }, [])

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setExtractedText("")
    setUploadResult(null)
    setIsUploading(true)
  }

  const handleUploadComplete = (result: { fileUrl: string; extractedText: string; fileName: string }) => {
    setIsUploading(false)
    setExtractedText(result.extractedText)
    setUploadResult({
      message: "✅ PDF সফলভাবে আপলোড এবং প্রসেস করা হয়েছে",
      fileName: result.fileName,
      textLength: result.extractedText.length,
      extractedText: result.extractedText
    })

    // Save to recent uploads
    const record: UploadRecord = {
      id: Date.now().toString(),
      name: result.fileName.replace('.pdf', ''),
      size: selectedFile?.size || 0,
      dateISO: new Date().toISOString(),
      extractedText: result.extractedText,
      fileUrl: result.fileUrl
    }

    const raw = localStorage.getItem("recentUploads") || "[]"
    let list: UploadRecord[] = []
    try {
      list = JSON.parse(raw)
    } catch {
      list = []
    }
    localStorage.setItem("recentUploads", JSON.stringify([record, ...list].slice(0, 25)))
    setRecent([record, ...recent].slice(0, 3))

    toast({
      title: "সফল!",
      description: "PDF আপলোড এবং টেক্সট এক্সট্রাক্ট সম্পন্ন হয়েছে",
    })
  }

  const handleUploadError = (error: string) => {
    setIsUploading(false)
    toast({
      title: "আপলোড ব্যর্থ",
      description: error,
      variant: "destructive"
    })
  }

  const handleReset = () => {
    setSelectedFile(null)
    setExtractedText("")
    setUploadResult(null)
    setIsUploading(false)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Upload Section */}
      <Card className="rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-neutral-900 dark:text-neutral-100">PDF আপলোড করুন</CardTitle>
          <CardDescription>আপনার PDF নোটস আপলোড করুন এবং টেক্সট এক্সট্রাক্ট করুন</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Using your PdfDropzone component */}
          <PdfDropzone
            onSelect={handleFileSelect}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="rounded-xl border p-4 bg-white dark:bg-neutral-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                  <FileText className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-800 dark:text-neutral-100">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {formatBytes(selectedFile.size)}
                  </p>
                </div>
                {isUploading && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    আপলোড হচ্ছে...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className="rounded-xl border p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <p className="font-medium text-green-800 dark:text-green-200">
                    {uploadResult.message}
                  </p>
                </div>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="text-green-700 border-green-300 hover:bg-green-100 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/30"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  নতুন ফাইল
                </Button>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                টেক্সট লেংথ: {uploadResult.textLength} অক্ষর
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extracted Text Display */}
      {extractedText && (
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-neutral-900 dark:text-neutral-100">এক্সট্রাক্ট করা টেক্সট</CardTitle>
            <CardDescription>আপনার PDF থেকে এক্সট্রাক্ট করা টেক্সট</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto rounded-lg border p-4 bg-neutral-50 dark:bg-neutral-800">
              <pre className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                {extractedText}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF Help Guide */}
      <Card className="rounded-xl shadow-lg border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
            💡 PDF আপলোড গাইড
          </CardTitle>
          <CardDescription>সফল text extraction এর জন্য সঠিক PDF ব্যবহার করুন</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">✅ কাজ করবে</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Word/Google Docs থেকে তৈরি PDF</li>
                <li>• Academic papers</li>
                <li>• eBooks</li>
                <li>• Text-based documents</li>
              </ul>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">⚠️ সীমিত সাপোর্ট</h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Mixed content PDFs</li>
                <li>• Complex layouts</li>
                <li>• Multi-language docs</li>
              </ul>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">❌ কাজ করবে না</h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>• Scanned documents</li>
                <li>• Screenshots</li>
                <li>• Image-based PDFs</li>
                <li>• Protected files</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>💡 টিপ:</strong> Scanned PDF এর জন্য Google Drive এ upload করে "Open with Google Docs" ব্যবহার করুন OCR এর জন্য।
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Uploads */}
      <Card className="rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-neutral-900 dark:text-neutral-100">সাম্প্রতিক আপলোড</CardTitle>
          <CardDescription>আপনার সাম্প্রতিক আপলোড করা ফাইলগুলো</CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-8">
              এখনো কোন ফাইল আপলোড করা হয়নি
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border p-4 bg-white dark:bg-neutral-800 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    if (r.extractedText) {
                      setExtractedText(r.extractedText)
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                        {r.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(r.dateISO).toLocaleDateString('bn-BD')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}