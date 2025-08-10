"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, RotateCcw, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type UploadRecord = {
  id: string
  name: string
  size: number
  dateISO: string
}

export default function HistoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [all, setAll] = React.useState<UploadRecord[]>([])
  const [query, setQuery] = React.useState("")
  const [from, setFrom] = React.useState<string>("")
  const [to, setTo] = React.useState<string>("")

  React.useEffect(() => {
    const raw = localStorage.getItem("recentUploads") || "[]"
    try {
      const arr = JSON.parse(raw) as UploadRecord[]
      const sorted = arr.sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))
      setAll(sorted)
    } catch {
      setAll([])
    }
  }, [])

  const filtered = all.filter((r) => {
    const matchesQuery = r.name.toLowerCase().includes(query.toLowerCase())
    const d = new Date(r.dateISO)
    const fromOk = from ? d >= new Date(from) : true
    const toOk = to ? d <= new Date(to) : true
    return matchesQuery && fromOk && toOk
  })

  const rerunAI = (id: string) => {
    // Simulate AI re-run
    toast({ title: "Re-running AI", description: "We’ll refresh the summary shortly." })
    setTimeout(() => {
      toast({ title: "Completed", description: "Summary updated." })
    }, 1200)
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Filters */}
      <Card className="mb-6 rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-neutral-900 dark:text-neutral-100">History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <Label htmlFor="search" className="sr-only">
                Search
              </Label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Search by title"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 rounded-xl shadow-md"
                />
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>
            <div>
              <Label htmlFor="from" className="text-xs text-neutral-500 dark:text-neutral-400">
                From
              </Label>
              <Input
                id="from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-xl shadow-md"
              />
            </div>
            <div>
              <Label htmlFor="to" className="text-xs text-neutral-500 dark:text-neutral-400">
                To
              </Label>
              <Input
                id="to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-xl shadow-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid of notes */}
      {filtered.length === 0 ? (
        <Card className="rounded-xl shadow-lg">
          <CardContent className="py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
            No notes match your search or date filters.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <Card key={r.id} className="rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle className="line-clamp-2 text-base text-neutral-900 dark:text-neutral-100">
                  {r.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="inline-flex items-center gap-2 rounded-lg bg-sky-500/10 px-3 py-1 text-xs text-sky-700 dark:bg-teal-500/10 dark:text-teal-300">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(r.dateISO).toLocaleDateString()}</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="secondary"
                  className="rounded-xl shadow-md"
                  onClick={() => router.push(`/summary/${r.id}`)}
                >
                  View Summary
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl shadow-md bg-white dark:bg-neutral-900"
                  onClick={() => rerunAI(r.id)}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Re-run AI
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
