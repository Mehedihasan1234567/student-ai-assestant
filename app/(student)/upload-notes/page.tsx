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
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [generatingType, setGeneratingType] = React.useState<'summary' | 'quiz' | null>(null)
  const [currentNoteId, setCurrentNoteId] = React.useState<number | null>(null)
  const [generatedSummary, setGeneratedSummary] = React.useState<any>(null)
  const [generatedQuiz, setGeneratedQuiz] = React.useState<any>(null)
  const [autoGenerate, setAutoGenerate] = React.useState(true)

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

  const handleUploadComplete = async (result: { fileUrl: string; extractedText: string; fileName: string }) => {
    setIsUploading(false)
    setExtractedText(result.extractedText)
    setUploadResult({
      message: "✅ ফাইল সফলভাবে আপলোড এবং প্রসেস করা হয়েছে",
      fileName: result.fileName,
      textLength: result.extractedText.length,
      extractedText: result.extractedText,
      fileUrl: result.fileUrl
    })

    // Save to recent uploads
    const record: UploadRecord = {
      id: Date.now().toString(),
      name: result.fileName.replace(/\.(pdf|jpg|jpeg|png|webp|gif|bmp)$/i, ''),
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
      description: "ফাইল আপলোড এবং টেক্সট এক্সট্রাক্ট সম্পন্ন হয়েছে",
    })

    // Auto-generate summary and quiz if enabled
    if (autoGenerate && result.extractedText && result.extractedText.trim().length > 50) {
      // Check if the extracted text is an error message
      const errorKeywords = ["API access denied", "error", "failed", "trouble", "permission", "key", "sorry"];
      const isErrorContent = errorKeywords.some(keyword =>
        result.extractedText.toLowerCase().includes(keyword.toLowerCase())
      );

      if (!isErrorContent) {
        await autoGenerateContent(result)
      } else {
        toast({
          title: "স্বয়ংক্রিয় প্রসেসিং বন্ধ",
          description: "টেক্সট এক্সট্রাকশনে সমস্যা হওয়ায় স্বয়ংক্রিয় সারসংক্ষেপ ও কুইজ তৈরি করা হয়নি",
          variant: "destructive"
        })
      }
    }
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
    setGeneratedSummary(null)
    setGeneratedQuiz(null)
    setCurrentNoteId(null)
  }

  const autoGenerateContent = async (result: { fileUrl: string; extractedText: string; fileName: string }) => {
    try {
      // First save the note
      const noteResponse = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.fileName || "Uploaded Document",
          content: result.extractedText,
          fileUrl: result.fileUrl
        }),
      })

      const noteData = await noteResponse.json()
      let noteId = null
      if (noteData.success) {
        noteId = noteData.note.id
        setCurrentNoteId(noteId)
      }

      // Generate both summary and quiz simultaneously
      const [summaryPromise, quizPromise] = await Promise.allSettled([
        // Generate Summary
        fetch("/api/generate-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            noteId: noteId?.toString() || "temp",
            content: result.extractedText,
            title: result.fileName || "Auto Summary"
          }),
        }),
        // Generate Quiz
        fetch("/api/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            noteId: noteId?.toString() || "temp",
            content: result.extractedText,
            title: result.fileName || "Auto Quiz",
            difficulty: "medium"
          }),
        })
      ])

      // Handle Summary Result
      if (summaryPromise.status === 'fulfilled') {
        const summaryData = await summaryPromise.value.json()
        if (summaryData.success) {
          setGeneratedSummary(summaryData.summary)
          toast({
            title: "সারসংক্ষেপ তৈরি!",
            description: "AI স্বয়ংক্রিয়ভাবে সারসংক্ষেপ তৈরি করেছে",
          })
        }
      }

      // Handle Quiz Result
      if (quizPromise.status === 'fulfilled') {
        const quizData = await quizPromise.value.json()
        if (quizData.success) {
          setGeneratedQuiz(quizData.quiz)
          toast({
            title: "কুইজ তৈরি!",
            description: "AI স্বয়ংক্রিয়ভাবে কুইজ তৈরি করেছে",
          })
        }
      }

    } catch (error) {
      console.error("Auto-generation error:", error)
      toast({
        title: "স্বয়ংক্রিয় তৈরি ব্যর্থ",
        description: "সারসংক্ষেপ এবং কুইজ স্বয়ংক্রিয়ভাবে তৈরি করতে সমস্যা হয়েছে",
        variant: "destructive"
      })
    }
  }

  const handleGenerateSummary = async () => {
    if (!extractedText || !uploadResult) return

    setIsGenerating(true)
    setGeneratingType('summary')

    try {
      // First save the note if not already saved
      let noteId = currentNoteId
      if (!noteId) {
        const noteResponse = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: uploadResult.fileName || "Uploaded Note",
            content: extractedText,
            fileUrl: uploadResult.fileUrl
          }),
        })

        const noteData = await noteResponse.json()
        if (noteData.success) {
          noteId = noteData.note.id
          setCurrentNoteId(noteId)
        }
      }

      // Generate summary
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteId: noteId.toString(),
          content: extractedText,
          title: uploadResult.fileName || "Summary"
        }),
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedSummary(data.summary)
        toast({
          title: "সফল!",
          description: "সারসংক্ষেপ তৈরি করা হয়েছে",
        })
      } else {
        toast({
          title: "ব্যর্থ",
          description: data.error || "সারসংক্ষেপ তৈরি করতে সমস্যা হয়েছে",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Summary generation error:", error)
      toast({
        title: "এরর",
        description: "সারসংক্ষেপ তৈরি করতে সমস্যা হয়েছে",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
      setGeneratingType(null)
    }
  }

  const handleGenerateQuiz = async () => {
    if (!extractedText || !uploadResult) return

    setIsGenerating(true)
    setGeneratingType('quiz')

    try {
      // First save the note if not already saved
      let noteId = currentNoteId
      if (!noteId) {
        const noteResponse = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: uploadResult.fileName || "Uploaded Note",
            content: extractedText,
            fileUrl: uploadResult.fileUrl
          }),
        })

        const noteData = await noteResponse.json()
        if (noteData.success) {
          noteId = noteData.note.id
          setCurrentNoteId(noteId)
        }
      }

      // Generate quiz
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteId: noteId.toString(),
          content: extractedText,
          title: uploadResult.fileName || "Quiz",
          difficulty: "medium"
        }),
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedQuiz(data.quiz)
        toast({
          title: "সফল!",
          description: "কুইজ তৈরি করা হয়েছে",
        })
      } else {
        toast({
          title: "ব্যর্থ",
          description: data.error || "কুইজ তৈরি করতে সমস্যা হয়েছে",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Quiz generation error:", error)
      toast({
        title: "এরর",
        description: "কুইজ তৈরি করতে সমস্যা হয়েছে",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
      setGeneratingType(null)
    }
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
          <CardTitle className="text-neutral-900 dark:text-neutral-100">Image/PDF আপলোড করুন</CardTitle>
          <CardDescription>আপনার Image বা PDF আপলোড করুন এবং AI দিয়ে টেক্সট এক্সট্রাক্ট করুন</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-generation Toggle */}
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200">🤖 স্বয়ংক্রিয় AI প্রসেসিং</h4>
              <p className="text-sm text-blue-600 dark:text-blue-300">আপলোডের পর স্বয়ংক্রিয়ভাবে সারসংক্ষেপ এবং কুইজ তৈরি করুন</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoGenerate}
                onChange={(e) => setAutoGenerate(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Demo Button */}
          <div className="flex items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <Button
              onClick={async () => {
                try {
                  const response = await fetch("/api/demo-content");
                  const data = await response.json();
                  if (data.success) {
                    await handleUploadComplete({
                      fileUrl: data.fileUrl,
                      extractedText: data.content,
                      fileName: data.fileName
                    });
                  }
                } catch (error) {
                  toast({
                    title: "ডেমো লোড ব্যর্থ",
                    description: "ডেমো কন্টেন্ট লোড করতে সমস্যা হয়েছে",
                    variant: "destructive"
                  });
                }
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              disabled={isUploading}
            >
              🚀 ডেমো কন্টেন্ট দিয়ে টেস্ট করুন
            </Button>
          </div>

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
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                টেক্সট লেংথ: {uploadResult.textLength} অক্ষর
              </p>

              {/* Auto-generation Status */}
              {autoGenerate && !generatedSummary && !generatedQuiz && (
                <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    AI স্বয়ংক্রিয়ভাবে সারসংক্ষেপ এবং কুইজ তৈরি করছে...
                  </span>
                </div>
              )}

              {/* Manual Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => handleGenerateSummary()}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  size="sm"
                  disabled={isGenerating}
                >
                  {isGenerating && generatingType === 'summary' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      তৈরি হচ্ছে...
                    </>
                  ) : (
                    <>
                      📝 {generatedSummary ? 'নতুন সারসংক্ষেপ তৈরি করুন' : 'সারসংক্ষেপ তৈরি করুন'}
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => handleGenerateQuiz()}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                  size="sm"
                  disabled={isGenerating}
                >
                  {isGenerating && generatingType === 'quiz' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      তৈরি হচ্ছে...
                    </>
                  ) : (
                    <>
                      ❓ {generatedQuiz ? 'নতুন কুইজ তৈরি করুন' : 'কুইজ তৈরি করুন'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Summary */}
      {generatedSummary && (
        <Card className="rounded-xl shadow-lg border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
              📝 AI সারসংক্ষেপ
            </CardTitle>
            <CardDescription>AI দ্বারা তৈরি করা সারসংক্ষেপ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose dark:prose-invert max-w-none">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">সারসংক্ষেপ:</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {typeof generatedSummary.summary === 'string'
                    ? generatedSummary.summary.replace(/```json|```/g, '').trim()
                    : generatedSummary.summary}
                </p>
              </div>

              {generatedSummary.keyPoints && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">মূল বিষয়সমূহ:</h4>
                  <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                    {generatedSummary.keyPoints.map((point: string, index: number) => (
                      <li key={index}>• {point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Quiz */}
      {generatedQuiz && (
        <Card className="rounded-xl shadow-lg border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <CardHeader>
            <CardTitle className="text-purple-800 dark:text-purple-200 flex items-center gap-2">
              ❓ AI কুইজ
            </CardTitle>
            <CardDescription className="text-purple-600 dark:text-purple-300">AI দ্বারা তৈরি করা কুইজ প্রশ্ন</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedQuiz.questions && generatedQuiz.questions.map((question: any, index: number) => (
                <div key={index} className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700 shadow-sm">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">
                    প্রশ্ন {index + 1}: {question.question}
                  </h4>
                  <div className="space-y-2">
                    {question.options && question.options.map((option: string, optIndex: number) => (
                      <div
                        key={optIndex}
                        className={cn(
                          "p-3 rounded-lg border text-sm transition-all duration-200",
                          optIndex === question.correctAnswer
                            ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 shadow-sm"
                            : "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                        )}
                      >
                        <span className="font-medium text-purple-800 dark:text-purple-200">{String.fromCharCode(65 + optIndex)})</span> {option}
                        {optIndex === question.correctAnswer && (
                          <span className="ml-2 text-green-600 dark:text-green-400 font-medium">✓ সঠিক উত্তর</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {question.explanation && (
                    <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
                      <p className="text-sm text-indigo-700 dark:text-indigo-300">
                        <strong>ব্যাখ্যা:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extracted Text Display */}
      {extractedText && (
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-neutral-900 dark:text-neutral-100">এক্সট্রাক্ট করা টেক্সট</CardTitle>
            <CardDescription>আপনার ফাইল থেকে AI দিয়ে এক্সট্রাক্ট করা টেক্সট</CardDescription>
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

      {/* AI-Powered Upload Guide */}
      <Card className="rounded-xl shadow-lg border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="text-purple-800 dark:text-purple-200 flex items-center gap-2">
            🆓 Free AI-Powered Text Extraction
          </CardTitle>
          <CardDescription>Local AI Processing দিয়ে সম্পূর্ণ ফ্রি text extraction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">✅ সাপোর্টেড ফাইল</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• PDF ডকুমেন্ট (text-based এবং image-based)</li>
                <li>• JPG, PNG, WebP ইমেজ</li>
                <li>• Screenshots এবং scanned documents</li>
                <li>• Handwritten notes (clear quality)</li>
                <li>• Academic papers এবং books</li>
                <li>• Complex layouts এবং tables</li>
              </ul>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">🆓 Free AI Features</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Local AI text processing</li>
                <li>• Free OCR for image and PDF processing</li>
                <li>• No API costs or usage limits</li>
                <li>• AI-powered summaries and quizzes</li>
                <li>• Multi-format document support</li>
                <li>• Completely free setup</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <p className="text-sm text-purple-800 dark:text-purple-200">
              <strong>🆓 Local AI Power:</strong> Local processing এর সাহায্যে সম্পূর্ণ ফ্রিতে text extraction, summary এবং quiz generation!
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