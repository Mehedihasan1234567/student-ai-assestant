"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Info, Play, Calendar, Trophy, AlertCircle, RefreshCw, FileQuestion } from "lucide-react"

type Question = {
  question: string
  type: string
  options: string[]
  correctAnswer: number
  explanation: string
}

type Quiz = {
  id: number
  title: string
  questions: Question[]
  createdAt: string
  noteId: number
  noteTitle: string
  questionCount: number
  attemptCount: number
  avgScore: number
}

type QuizAttempt = {
  id: number
  score: number
  totalQuestions: number
  completedAt: string
}

export default function QuizzesPage() {
  const { toast } = useToast()
  const [quizzes, setQuizzes] = React.useState<Quiz[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedQuiz, setSelectedQuiz] = React.useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0)
  const [selectedAnswers, setSelectedAnswers] = React.useState<number[]>([])
  const [showResults, setShowResults] = React.useState(false)
  const [quizResult, setQuizResult] = React.useState<any>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [mode, setMode] = React.useState<'list' | 'taking' | 'results'>('list')

  React.useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/quizzes?limit=20")
      const data = await response.json()

      if (data.success) {
        setQuizzes(data.quizzes || [])
      } else {
        setError("কুইজ লোড করতে সমস্যা হয়েছে")
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error)
      setError("কুইজ লোড করতে সমস্যা হয়েছে")
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = async (quizId: number) => {
    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId })
      })

      const data = await response.json()

      if (data.success) {
        setSelectedQuiz(data.quiz)
        setCurrentQuestionIndex(0)
        setSelectedAnswers(new Array(data.quiz.questions.length).fill(-1))
        setShowResults(false)
        setMode('taking')
      } else {
        toast({
          title: "এরর",
          description: "কুইজ লোড করতে সমস্যা হয়েছে",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error starting quiz:", error)
      toast({
        title: "এরর",
        description: "কুইজ শুরু করতে সমস্যা হয়েছে",
        variant: "destructive"
      })
    }
  }

  const submitQuiz = async () => {
    if (!selectedQuiz) return

    try {
      const response = await fetch("/api/submit-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: selectedQuiz.id,
          answers: selectedAnswers
        })
      })

      const data = await response.json()

      if (data.success) {
        setQuizResult(data.result)
        setMode('results')
        toast({
          title: "সফল!",
          description: `আপনার স্কোর: ${data.result.score}/${data.result.totalQuestions}`,
        })
      } else {
        toast({
          title: "এরর",
          description: "কুইজ জমা দিতে সমস্যা হয়েছে",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
      toast({
        title: "এরর",
        description: "কুইজ জমা দিতে সমস্যা হয়েছে",
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

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400"
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              কুইজসমূহ
            </CardTitle>
            <CardDescription>AI দ্বারা তৈরি করা কুইজসমূহ</CardDescription>
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
          <Button onClick={fetchQuizzes} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            আবার চেষ্টা করুন
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Quiz Taking Mode
  if (mode === 'taking' && selectedQuiz) {
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex]
    const isLastQuestion = currentQuestionIndex === selectedQuiz.questions.length - 1
    const allAnswered = selectedAnswers.every(answer => answer !== -1)

    return (
      <div className="mx-auto max-w-3xl">
        <Card className="rounded-xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-neutral-900 dark:text-neutral-100">
              {selectedQuiz.title}
            </CardTitle>
            <div className="text-sm text-neutral-600 dark:text-neutral-300">
              {currentQuestionIndex + 1} / {selectedQuiz.questions.length}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question */}
            <div className="rounded-xl border p-4 shadow-md bg-orange-50/60 dark:bg-orange-900/20 border-orange-200/60 dark:border-orange-800/50">
              <p className="mb-4 text-base font-medium text-neutral-900 dark:text-neutral-100">
                {currentQuestion.question}
              </p>

              <RadioGroup 
                value={selectedAnswers[currentQuestionIndex]?.toString() || ""} 
                onValueChange={(value) => {
                  const newAnswers = [...selectedAnswers]
                  newAnswers[currentQuestionIndex] = parseInt(value)
                  setSelectedAnswers(newAnswers)
                }}
                className="grid gap-2"
              >
                {currentQuestion.options.map((option, index) => (
                  <Label
                    key={index}
                    htmlFor={`option-${index}`}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 shadow-sm transition hover:bg-orange-100/40 dark:hover:bg-orange-900/30 bg-white dark:bg-neutral-900"
                  >
                    <RadioGroupItem id={`option-${index}`} value={index.toString()} />
                    <span className="text-sm text-neutral-800 dark:text-neutral-200">{option}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                পূর্ববর্তী
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={submitQuiz}
                  disabled={!allAnswered}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  কুইজ জমা দিন
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(Math.min(selectedQuiz.questions.length - 1, currentQuestionIndex + 1))}
                >
                  পরবর্তী
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Progress */}
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Results Mode
  if (mode === 'results' && quizResult) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Results Summary */}
        <Card className="rounded-xl shadow-lg border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              কুইজ সম্পন্ন!
            </CardTitle>
            <CardDescription>আপনার পারফরমেন্স রিপোর্ট</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {quizResult.score}/{quizResult.totalQuestions}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">সঠিক উত্তর</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {quizResult.percentage}%
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">স্কোর</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {quizResult.performanceLevel === 'excellent' ? 'চমৎকার' :
                   quizResult.performanceLevel === 'good' ? 'ভালো' :
                   quizResult.performanceLevel === 'fair' ? 'মোটামুটি' : 'উন্নতি প্রয়োজন'}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">পারফরমেন্স</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200">{quizResult.message}</p>
            </div>
          </CardContent>
        </Card>

        {/* Back to List */}
        <div className="text-center">
          <Button onClick={() => setMode('list')} variant="outline">
            কুইজ তালিকায় ফিরে যান
          </Button>
        </div>
      </div>
    )
  }

  // Quiz List Mode
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="rounded-xl shadow-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
            <FileQuestion className="h-6 w-6" />
            কুইজসমূহ
          </CardTitle>
          <CardDescription>
            AI দ্বারা তৈরি করা কুইজসমূহ - মোট {quizzes.length}টি
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quizzes List */}
      {quizzes.length === 0 ? (
        <Card className="rounded-xl shadow-lg">
          <CardContent className="text-center py-12">
            <FileQuestion className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              কোন কুইজ নেই
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              প্রথমে PDF আপলোড করে কুইজ তৈরি করুন
            </p>
            <Button 
              onClick={() => window.location.href = '/upload-notes'}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              PDF আপলোড করুন
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card 
              key={quiz.id} 
              className="rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-orange-500"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-1">
                      {quiz.title}
                    </CardTitle>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {quiz.noteTitle}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {quiz.questionCount} প্রশ্ন
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(quiz.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      {quiz.attemptCount} বার নেওয়া
                    </div>
                  </div>
                  
                  {quiz.avgScore > 0 && (
                    <div className="text-center">
                      <span className={cn("text-sm font-medium", getScoreColor(quiz.avgScore))}>
                        গড় স্কোর: {quiz.avgScore}%
                      </span>
                    </div>
                  )}

                  <Button 
                    onClick={() => startQuiz(quiz.id)}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    কুইজ শুরু করুন
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}