"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Calendar, Eye, Sparkles, RefreshCw, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

type Summary = {
  id: number
  title: string
  summary: string
  keyPoints: string[]
  createdAt: string
  noteId: number
  noteTitle: string
}

export default function AISummariesPage() {
  const { toast } = useToast()
  const [summaries, setSummaries] = React.useState<Summary[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedSummary, setSelectedSummary] = React.useState<Summary | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch summaries on component mount
  React.useEffect(() => {
    fetchSummaries()
  }, [])

  const fetchSummaries = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/summaries?limit=20")
      const data = await response.json()

      if (data.success) {
        setSummaries(data.summaries || [])
      } else {
        setError("সারসংক্ষেপ লোড করতে সমস্যা হয়েছে")
      }
    } catch (error) {
      console.error("Error fetching summaries:", error)
      setError("সারসংক্ষেপ লোড করতে সমস্যা হয়েছে")
    } finally {
      setLoading(false)
    }
  }

  const handleViewSummary = async (summaryId: number) => {
    try {
      const response = await fetch("/api/summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryId })
      })

      const data = await response.json()

      if (data.success) {
        setSelectedSummary(data.summary)
      } else {
        toast({
          title: "এরর",
          description: "সারসংক্ষেপ লোড করতে সমস্যা হয়েছে",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching summary details:", error)
      toast({
        title: "এরর",
        description: "সারসংক্ষেপ লোড করতে সমস্যা হয়েছে",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const cleanSummaryText = (summary: string) => {
    // Remove JSON formatting and code blocks
    return summary
      .replace(/```json|```/g, '')
      .replace(/^\s*{\s*"summary":\s*"/i, '')
      .replace(/",?\s*"keyPoints".*$/s, '')
      .replace(/\\n/g, '\n')
      .trim()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600 dark:text-teal-400" />
              AI সারসংক্ষেপ
            </CardTitle>
            <CardDescription>AI দ্বারা তৈরি করা সারসংক্ষেপসমূহ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border p-4 shadow-sm">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="rounded-xl shadow-lg border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            এরর
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <Button onClick={fetchSummaries} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            আবার চেষ্টা করুন
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="rounded-xl shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
        <CardHeader>
          <CardTitle className="text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            AI সারসংক্ষেপ
          </CardTitle>
          <CardDescription>
            AI দ্বারা তৈরি করা সারসংক্ষেপসমূহ - মোট {summaries.length}টি
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Summaries List */}
      {summaries.length === 0 ? (
        <Card className="rounded-xl shadow-lg">
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              কোন সারসংক্ষেপ নেই
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              প্রথমে PDF আপলোড করে সারসংক্ষেপ তৈরি করুন
            </p>
            <Button 
              onClick={() => window.location.href = '/upload-notes'}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              PDF আপলোড করুন
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {summaries.map((summary) => (
            <Card 
              key={summary.id} 
              className="rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-l-indigo-500"
              onClick={() => handleViewSummary(summary.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                      {summary.title}
                    </CardTitle>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {summary.noteTitle}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    AI
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3 overflow-hidden" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {cleanSummaryText(summary.summary).substring(0, 120)}...
                </p>
                
                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(summary.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    বিস্তারিত দেখুন
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Summary Modal/Detail View */}
      {selectedSummary && (
        <Card className="rounded-xl shadow-lg border-indigo-200 dark:border-indigo-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-indigo-800 dark:text-indigo-200">
                {selectedSummary.title}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedSummary(null)}
              >
                বন্ধ করুন
              </Button>
            </div>
            <CardDescription>
              {selectedSummary.noteTitle} - {formatDate(selectedSummary.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Text */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-3">
                📝 সারসংক্ষেপ:
              </h4>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
                  {cleanSummaryText(selectedSummary.summary)}
                </p>
              </div>
            </div>

            {/* Key Points */}
            {selectedSummary.keyPoints && selectedSummary.keyPoints.length > 0 && (
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">
                  🔑 মূল বিষয়সমূহ:
                </h4>
                <ul className="space-y-2">
                  {selectedSummary.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-purple-700 dark:text-purple-300">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                size="sm"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                onClick={() => {
                  // Navigate to quiz generation for this note
                  window.location.href = `/upload-notes?noteId=${selectedSummary.noteId}`
                }}
              >
                কুইজ তৈরি করুন
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Copy summary to clipboard
                  navigator.clipboard.writeText(cleanSummaryText(selectedSummary.summary))
                  toast({
                    title: "কপি করা হয়েছে",
                    description: "সারসংক্ষেপ clipboard এ কপি করা হয়েছে"
                  })
                }}
              >
                কপি করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
