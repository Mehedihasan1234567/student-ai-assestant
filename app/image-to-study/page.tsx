"use client"

import * as React from "react"
import { Upload, FileText, Brain, BookOpen, HelpCircle, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PdfDropzone } from "@/components/pdf-dropzone"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

type ProcessingStep = "upload" | "extract" | "generate" | "complete"

export default function ImageToStudyPage() {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = React.useState<ProcessingStep>("upload")
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [extractedText, setExtractedText] = React.useState<string>("")
  const [generatedSummary, setGeneratedSummary] = React.useState<any>(null)
  const [generatedQuiz, setGeneratedQuiz] = React.useState<any>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setCurrentStep("upload")
    setIsProcessing(true)
  }

  const handleUploadComplete = async (result: { fileUrl: string; extractedText: string; fileName: string }) => {
    setExtractedText(result.extractedText)
    setCurrentStep("extract")
    
    toast({
      title: "টেক্সট এক্সট্রাক্ট সম্পন্ন!",
      description: `${result.extractedText.length} অক্ষর সফলভাবে এক্সট্রাক্ট করা হয়েছে`,
    })

    // Auto-generate summary and quiz
    if (result.extractedText && result.extractedText.trim().length > 50) {
      setCurrentStep("generate")
      await generateContent(result)
    }
  }

  const generateContent = async (result: { fileUrl: string; extractedText: string; fileName: string }) => {
    try {
      // Save note first
      const noteResponse = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.fileName || "AI Study Material",
          content: result.extractedText,
          fileUrl: result.fileUrl
        }),
      })

      const noteData = await noteResponse.json()
      const noteId = noteData.success ? noteData.note.id : "temp"

      // Generate both summary and quiz
      const [summaryResponse, quizResponse] = await Promise.all([
        fetch("/api/generate-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            noteId: noteId.toString(),
            content: result.extractedText,
            title: result.fileName || "AI Summary"
          }),
        }),
        fetch("/api/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            noteId: noteId.toString(),
            content: result.extractedText,
            title: result.fileName || "AI Quiz",
            difficulty: "medium"
          }),
        })
      ])

      const [summaryData, quizData] = await Promise.all([
        summaryResponse.json(),
        quizResponse.json()
      ])

      if (summaryData.success) {
        setGeneratedSummary(summaryData.summary)
      }

      if (quizData.success) {
        setGeneratedQuiz(quizData.quiz)
      }

      setCurrentStep("complete")
      setIsProcessing(false)

      toast({
        title: "🎉 সম্পন্ন!",
        description: "AI সফলভাবে সারসংক্ষেপ এবং কুইজ তৈরি করেছে",
      })

    } catch (error) {
      console.error("Generation error:", error)
      setIsProcessing(false)
      toast({
        title: "এরর",
        description: "সারসংক্ষেপ এবং কুইজ তৈরি করতে সমস্যা হয়েছে",
        variant: "destructive"
      })
    }
  }

  const handleUploadError = (error: string) => {
    setIsProcessing(false)
    toast({
      title: "আপলোড ব্যর্থ",
      description: error,
      variant: "destructive"
    })
  }

  const resetProcess = () => {
    setSelectedFile(null)
    setExtractedText("")
    setGeneratedSummary(null)
    setGeneratedQuiz(null)
    setCurrentStep("upload")
    setIsProcessing(false)
  }

  const steps = [
    { id: "upload", title: "আপলোড", icon: Upload, description: "Image/PDF আপলোড করুন" },
    { id: "extract", title: "টেক্সট এক্সট্রাক্ট", icon: FileText, description: "AI দিয়ে টেক্সট পড়ুন" },
    { id: "generate", title: "AI প্রসেসিং", icon: Brain, description: "সারসংক্ষেপ ও কুইজ তৈরি" },
    { id: "complete", title: "সম্পন্ন", icon: CheckCircle, description: "স্টাডি ম্যাটেরিয়াল প্রস্তুত" }
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          🤖 AI Study Assistant
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Image বা PDF আপলোড করুন → AI টেক্সট পড়বে → স্বয়ংক্রিয়ভাবে সারসংক্ষেপ ও কুইজ তৈরি করবে
        </p>
      </div>

      {/* Progress Steps */}
      <Card className="rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">প্রসেসিং স্টেপস</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index
              const Icon = step.icon

              return (
                <div key={step.id} className="flex flex-col items-center space-y-2">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all",
                    isCompleted ? "bg-green-500 border-green-500 text-white" :
                    isActive ? "bg-blue-500 border-blue-500 text-white" :
                    "bg-neutral-100 border-neutral-300 text-neutral-400 dark:bg-neutral-800 dark:border-neutral-600"
                  )}>
                    {isActive && isProcessing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className={cn(
                      "text-sm font-medium",
                      isCompleted || isActive ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-500"
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      {currentStep === "upload" && (
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              ফাইল আপলোড করুন
            </CardTitle>
            <CardDescription>
              Image (JPG, PNG, WebP) বা PDF ফাইল আপলোড করুন। AI স্বয়ংক্রিয়ভাবে টেক্সট পড়ে সারসংক্ষেপ ও কুইজ তৈরি করবে।
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PdfDropzone
              onSelect={handleFileSelect}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />
          </CardContent>
        </Card>
      )}

      {/* Processing Status */}
      {(currentStep === "extract" || currentStep === "generate") && (
        <Card className="rounded-xl shadow-lg border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-y-4 flex-col">
              <div className="flex items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                    {currentStep === "extract" ? "টেক্সট এক্সট্রাক্ট করা হচ্ছে..." : "AI সারসংক্ষেপ ও কুইজ তৈরি করছে..."}
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    {currentStep === "extract" ? 
                      "numind/NuMarkdown-8B-Thinking AI আপনার ফাইল পড়ছে" : 
                      "AI আপনার জন্য স্টাডি ম্যাটেরিয়াল প্রস্তুত করছে"
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {currentStep === "complete" && (
        <div className="space-y-6">
          {/* Success Message */}
          <Card className="rounded-xl shadow-lg border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                      🎉 সফলভাবে সম্পন্ন!
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      AI আপনার জন্য সারসংক্ষেপ এবং কুইজ তৈরি করেছে
                    </p>
                  </div>
                </div>
                <Button onClick={resetProcess} variant="outline">
                  নতুন ফাইল আপলোড করুন
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Summary */}
          {generatedSummary && (
            <Card className="rounded-xl shadow-lg border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  AI সারসংক্ষেপ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          )}

          {/* Generated Quiz */}
          {generatedQuiz && (
            <Card className="rounded-xl shadow-lg border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
              <CardHeader>
                <CardTitle className="text-purple-800 dark:text-purple-200 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  AI কুইজ
                </CardTitle>
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

          {/* Extracted Text */}
          {extractedText && (
            <Card className="rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-neutral-900 dark:text-neutral-100">এক্সট্রাক্ট করা টেক্সট</CardTitle>
                <CardDescription>AI দ্বারা আপনার ফাইল থেকে এক্সট্রাক্ট করা টেক্সট</CardDescription>
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
        </div>
      )}

      {/* Features */}
      <Card className="rounded-xl shadow-lg border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="text-purple-800 dark:text-purple-200 flex items-center gap-2">
            🚀 AI Features
          </CardTitle>
          <CardDescription>numind/NuMarkdown-8B-Thinking এর শক্তিশালী ফিচারসমূহ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">📖 স্মার্ট টেক্সট এক্সট্রাক্ট</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Image এবং PDF থেকে উন্নত OCR দিয়ে টেক্সট পড়ে
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">📝 স্বয়ংক্রিয় সারসংক্ষেপ</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                মূল বিষয় এবং গুরুত্বপূর্ণ পয়েন্ট নিয়ে সারসংক্ষেপ তৈরি
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">❓ ইন্টেলিজেন্ট কুইজ</h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                বিষয়বস্তু বুঝে প্রশ্ন ও উত্তর সহ কুইজ তৈরি
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}