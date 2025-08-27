"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { jsPDF } from "jspdf"
import { Copy, Download, ListChecks } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type Summary = {
  id: string
  title: string
  summary: string
  noteId: number
}

export default function SummaryPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const router = useRouter()
  const [data, setData] = React.useState<Summary | null>(null)

  React.useEffect(() => {
    if (!id) return

    const fetchSummary = async () => {
      const res = await fetch("/api/summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryId: id }),
      });

      if (res.ok) {
        const summaryData = await res.json();
        setData(summaryData.summary);
      } else {
        setData({
          id: String(id),
          title: "Untitled Notes",
          summary:
            "No saved summary was found for this upload. This is a placeholder. Paste or generate a new summary to continue.",
          noteId: 0,
        })
      }
    };

    fetchSummary();
  }, [id])

  const handleCopy = async () => {
    if (!data) return
    await navigator.clipboard.writeText(data.summary)
    toast({ title: "Copied", description: "Summary copied to clipboard." })
  }

  const handleDownloadPdf = () => {
    if (!data) return
    const doc = new jsPDF({ unit: "pt", compress: true })
    const margin = 48
    const pageWidth = doc.internal.pageSize.getWidth()
    const maxWidth = pageWidth - margin * 2

    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text(data.title, margin, 64)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    const lines = doc.splitTextToSize(data.summary, maxWidth)
    let y = 96
    const pageHeight = doc.internal.pageSize.getHeight()
    const lineHeight = 18
    lines.forEach((line) => {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(String(line), margin, y)
      y += lineHeight
    })
    doc.save(`${data.title || "summary"}.pdf`)
  }

  const handleGenerateQuiz = () => {
    if (!data) return;
    router.push(`/quizzes?noteId=${data.noteId}`)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="rounded-xl shadow-lg">
        <CardHeader
          className={cn("rounded-t-xl", "bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-fuchsia-500/10")}
        >
          <CardTitle className="text-neutral-900 dark:text-neutral-100">{data?.title ?? "Loading..."}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleCopy} className="rounded-xl shadow-md">
              <Copy className="mr-2 h-4 w-4" />
              Copy Summary
            </Button>
            <Button
              onClick={handleDownloadPdf}
              className="rounded-xl shadow-md bg-indigo-600 hover:bg-indigo-700 dark:bg-violet-600 dark:hover:bg-violet-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleGenerateQuiz} className="rounded-xl shadow-md bg-transparent">
              <ListChecks className="mr-2 h-4 w-4" />
              Generate Quiz
            </Button>
          </div>

          {/* Scrollable summary */}
          <div
            className={cn(
              "max-h-[60vh] overflow-auto rounded-xl p-4 shadow-md",
              "bg-violet-50/60 dark:bg-violet-950/20",
            )}
          >
            <div className="space-y-4 text-sm leading-7 text-neutral-700 dark:text-neutral-300">
              {(data?.summary ?? "")
                .split("\n\n")
                .filter(Boolean)
                .map((para, idx) => (
                  <p key={idx} className="whitespace-pre-wrap">
                    {para}
                  </p>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
