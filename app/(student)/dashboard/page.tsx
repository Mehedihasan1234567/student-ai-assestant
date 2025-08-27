"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, ListChecks, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = React.useState(null);
  const [notes, setNotes] = React.useState([]);
  const [summaries, setSummaries] = React.useState([]);
  const [quizzesTaken, setQuizzesTaken] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      const [userRes, notesRes, summariesRes, historyRes] = await Promise.all([
        fetch("/api/users/me"),
        fetch("/api/notes"),
        fetch("/api/summaries"),
        fetch("/api/study-history"),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

      if (notesRes.ok) {
        const notesData = await notesRes.json();
        setNotes(notesData.notes);
      }

      if (summariesRes.ok) {
        const summariesData = await summariesRes.json();
        setSummaries(summariesData.summaries);
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setQuizzesTaken(historyData.data.statistics.totalQuizAttempts);
      }
    };

    fetchData();
  }, []);

  const recentNotes = notes.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome + CTA */}
      <Card className="rounded-xl shadow-lg">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Welcome back, {user?.name || "Student"}! 👋</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Continue your learning journey with quick summaries and quizzes.
            </p>
          </div>
          <Button
            asChild
            className="rounded-xl shadow-md bg-indigo-600 hover:bg-indigo-700 dark:bg-teal-600 dark:hover:bg-teal-700"
          >
            <Link href="/upload-notes">
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload New Note
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm text-neutral-600 dark:text-neutral-300">Total Notes Uploaded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl bg-indigo-500/10 p-6 text-center dark:bg-teal-500/10">
              <p className="text-4xl font-bold text-indigo-600 dark:text-teal-400">{notes.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm text-neutral-600 dark:text-neutral-300">Summaries Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl bg-indigo-500/10 p-6 text-center dark:bg-teal-500/10">
              <p className="text-4xl font-bold text-indigo-600 dark:text-teal-400">{summaries.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm text-neutral-600 dark:text-neutral-300">Quizzes Taken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl bg-indigo-500/10 p-6 text-center dark:bg-teal-500/10">
              <p className="text-4xl font-bold text-indigo-600 dark:text-teal-400">{quizzesTaken}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recently viewed summaries */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Recently viewed summaries</p>
        {recentNotes.length === 0 ? (
          <Card className="rounded-xl shadow-lg">
            <CardContent className="py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
              Your latest summaries will appear here after you upload notes.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => router.push(`/summary/${note.id}`)}
                className={cn(
                  "text-left rounded-xl border p-4 shadow-md transition hover:shadow-lg",
                  "bg-white dark:bg-neutral-900 hover:bg-indigo-50/60 dark:hover:bg-teal-900/20",
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600 dark:text-teal-400" />
                  <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">{note.title}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick quiz preview */}
      <Card className="rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-neutral-900 dark:text-neutral-100">Take a quick quiz</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="max-w-xl text-sm text-neutral-600 dark:text-neutral-300">
            Practice with a short multiple-choice quiz to check your understanding of recent topics.
          </div>
          <Button
            onClick={() => router.push("/quizzes")}
            className="rounded-xl shadow-md bg-indigo-600 hover:bg-indigo-700 dark:bg-teal-600 dark:hover:bg-teal-700"
          >
            <ListChecks className="mr-2 h-4 w-4" />
            Start Quick Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
