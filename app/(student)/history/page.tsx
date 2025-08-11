"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, History, TrendingUp, FileText, Brain, HelpCircle, AlertCircle, RefreshCw, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type StudyHistoryItem = {
  id: number
  action: string
  actionLabel: string
  details: any
  createdAt: string
  noteTitle: string
  noteId: number
}

type StudyStatistics = {
  totalNotes: number
  totalSummaries: number
  totalQuizzes: number
  totalQuizAttempts: number
  averageQuizScore: number
}

type RecentActivity = {
  action: string
  actionLabel: string
  count: number
}

export default function HistoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [history, setHistory] = React.useState<StudyHistoryItem[]>([])
  const [statistics, setStatistics] = React.useState<StudyStatistics | null>(null)
  const [recentActivity, setRecentActivity] = React.useState<RecentActivity[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [query, setQuery] = React.useState("")
  const [selectedAction, setSelectedAction] = React.useState<string>("all")

  React.useEffect(() => {
    fetchStudyHistory()
  }, [])

  const fetchStudyHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/study-history?limit=50")
      const data = await response.json()

      if (data.success) {
        setHistory(data.data.history || [])
        setStatistics(data.data.statistics || null)
        setRecentActivity(data.data.recentActivity || [])
      } else {
        setError("ইতিহাস লোড করতে সমস্যা হয়েছে")
      }
    } catch (error) {
      console.error("Error fetching study history:", error)
      setError("ইতিহাস লোড করতে সমস্যা হয়েছে")
    } finally {
      setLoading(false)
    }
  }

  const filtered = history.filter((item) => {
    const matchesQuery = item.noteTitle?.toLowerCase().includes(query.toLowerCase()) ||
      item.actionLabel.toLowerCase().includes(query.toLowerCase())
    const matchesAction = selectedAction === "all" || item.action === selectedAction
    return matchesQuery && matchesAction
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'upload': return <FileText className="h-4 w-4" />
      case 'summary': return <Brain className="h-4 w-4" />
      case 'quiz': return <HelpCircle className="h-4 w-4" />
      case 'quiz_attempt': return <TrendingUp className="h-4 w-4" />
      default: return <History className="h-4 w-4" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'upload': return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      case 'summary': return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
      case 'quiz': return "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800"
      case 'quiz_attempt': return "bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
      default: return "bg-neutral-500/10 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-600 dark:text-teal-400" />
              অধ্যয়ন ইতিহাস
            </CardTitle>
            <CardDescription>আপনার অধ্যয়ন কার্যক্রমের ইতিহাস</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
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
          <Button onClick={fetchStudyHistory} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            আবার চেষ্টা করুন
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-xl shadow-lg border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {statistics.totalNotes}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">মোট নোট</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-lg border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {statistics.totalSummaries}
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">সারসংক্ষেপ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-lg border-orange-200 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <HelpCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {statistics.totalQuizzes}
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">কুইজ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-lg border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {statistics.averageQuizScore}%
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">গড় স্কোর</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-600 dark:text-teal-400" />
            অধ্যয়ন ইতিহাস
          </CardTitle>
          <CardDescription>আপনার সমস্ত অধ্যয়ন কার্যক্রমের বিস্তারিত ইতিহাস</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="search" className="sr-only">
                অনুসন্ধান
              </Label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="নোট বা কার্যক্রম অনুসন্ধান করুন"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 rounded-xl shadow-md"
                />
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>
            <div>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="rounded-xl shadow-md">
                  <SelectValue placeholder="কার্যক্রম ফিল্টার করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব কার্যক্রম</SelectItem>
                  <SelectItem value="upload">নোট আপলোড</SelectItem>
                  <SelectItem value="summary">সারসংক্ষেপ তৈরি</SelectItem>
                  <SelectItem value="quiz">কুইজ তৈরি</SelectItem>
                  <SelectItem value="quiz_attempt">কুইজ অংশগ্রহণ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-neutral-900 dark:text-neutral-100">
              সাম্প্রতিক কার্যক্রম (গত ৭ দিন)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className={cn("p-2 rounded-lg", getActionColor(activity.action))}>
                    {getActionIcon(activity.action)}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {activity.count}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {activity.actionLabel}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History List */}
      {filtered.length === 0 ? (
        <Card className="rounded-xl shadow-lg">
          <CardContent className="text-center py-12">
            <History className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              কোন ইতিহাস নেই
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              {query || selectedAction !== "all" ? "আপনার ফিল্টার অনুযায়ী কোন কার্যক্রম পাওয়া যায়নি" : "এখনো কোন অধ্যয়ন কার্যক্রম নেই"}
            </p>
            {!query && selectedAction === "all" && (
              <Button
                onClick={() => router.push('/upload-notes')}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                PDF আপলোড করুন
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className={cn(
                "rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-l-4",
                getActionColor(item.action)
              )}
              onClick={() => {
                if (item.noteId) {
                  router.push(`/upload-notes?noteId=${item.noteId}`)
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={cn("p-2 rounded-lg", getActionColor(item.action))}>
                      {getActionIcon(item.action)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                          {item.actionLabel}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {item.action}
                        </Badge>
                      </div>
                      {item.noteTitle && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-2">
                          নোট: {item.noteTitle}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.createdAt)}
                        </div>
                        {item.details && (
                          <div className="flex items-center gap-1">
                            {item.details.score !== undefined && (
                              <span>স্কোর: {item.details.score}/{item.details.totalQuestions}</span>
                            )}
                            {item.details.questionCount && (
                              <span>{item.details.questionCount} প্রশ্ন</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}