"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Info } from "lucide-react"

type Question = {
  id: string
  prompt: string
  options: string[]
  answerIndex: number
  explanation: string
}

const sampleQuestions: Question[] = [
  {
    id: "q1",
    prompt: "Which organelle is primarily responsible for energy production in eukaryotic cells?",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
    answerIndex: 1,
    explanation:
      "Mitochondria generate ATP through cellular respiration, making them the cell’s powerhouse for energy.",
  },
  {
    id: "q2",
    prompt: "In kinematics, which quantity is the derivative of position with respect to time?",
    options: ["Acceleration", "Velocity", "Displacement", "Jerk"],
    answerIndex: 1,
    explanation:
      "Velocity is the rate of change of position with respect to time (v = dx/dt). Acceleration is the derivative of velocity.",
  },
  {
    id: "q3",
    prompt: "During the Renaissance, humanism emphasized which of the following?",
    options: [
      "Divine right of kings",
      "Scholasticism and purely theological debates",
      "Human potential and achievements",
      "Isolation from classical texts",
    ],
    answerIndex: 2,
    explanation:
      "Humanism focused on human potential, achievements, and a renewed interest in classical Greek and Roman texts.",
  },
  {
    id: "q4",
    prompt: "Which statement best describes ionic bonding?",
    options: [
      "Sharing of electron pairs between atoms",
      "Electrostatic attraction between oppositely charged ions",
      "Overlapping of p-orbitals",
      "Delocalized electrons in a lattice of metal cations",
    ],
    answerIndex: 1,
    explanation: "Ionic bonds form via electrostatic attraction between cations and anions after electron transfer.",
  },
  {
    id: "q5",
    prompt: "Which formula relates force, mass, and acceleration?",
    options: ["F = ma", "v = u + at", "W = mg", "p = mv"],
    answerIndex: 0,
    explanation: "Newton’s second law states F = ma, where force equals mass times acceleration.",
  },
]

export default function QuizzesPage() {
  const total = sampleQuestions.length
  const [index, setIndex] = React.useState(0)
  const [selected, setSelected] = React.useState<string>("")
  const [checked, setChecked] = React.useState(false)
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null)
  const { toast } = useToast()

  const q = sampleQuestions[index]

  React.useEffect(() => {
    // Reset state when navigating to a different question
    setSelected("")
    setChecked(false)
    setIsCorrect(null)
  }, [index])

  const handleCheck = () => {
    if (selected === "") {
      toast({ title: "Pick an option", description: "Please select an answer before checking." })
      return
    }
    const chosenIndex = q.options.findIndex((o) => o === selected)
    const correct = chosenIndex === q.answerIndex
    setChecked(true)
    setIsCorrect(correct)
  }

  const goPrev = () => setIndex((i) => Math.max(0, i - 1))
  const goNext = () => setIndex((i) => Math.min(total - 1, i + 1))

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="rounded-xl shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-neutral-900 dark:text-neutral-100">Quiz</CardTitle>
          <div className="text-sm text-neutral-600 dark:text-neutral-300">
            {index + 1} of {total}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question */}
          <div
            className={cn(
              "rounded-xl border p-4 shadow-md",
              "bg-indigo-50/60 dark:bg-teal-900/20 border-indigo-200/60 dark:border-teal-800/50",
            )}
          >
            <p className="mb-4 text-base font-medium text-neutral-900 dark:text-neutral-100">{q.prompt}</p>

            <RadioGroup value={selected} onValueChange={setSelected} className="grid gap-2" aria-label="Answer options">
              {q.options.map((opt, i) => {
                const isAnswer = i === q.answerIndex
                const isChosen = selected === opt
                const showState = checked
                const correctStyles =
                  showState && isAnswer ? "border-green-500/60 bg-green-50/70 dark:bg-green-900/20" : ""
                const incorrectStyles =
                  showState && isChosen && !isAnswer ? "border-rose-400/60 bg-rose-50/70 dark:bg-rose-900/20" : ""
                return (
                  <Label
                    key={opt}
                    htmlFor={`opt-${i}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border p-3 shadow-sm transition",
                      "hover:bg-indigo-100/40 dark:hover:bg-teal-900/30",
                      correctStyles || incorrectStyles || "bg-white dark:bg-neutral-900",
                    )}
                  >
                    <RadioGroupItem id={`opt-${i}`} value={opt} />
                    <span className="text-sm text-neutral-800 dark:text-neutral-200">{opt}</span>
                  </Label>
                )
              })}
            </RadioGroup>

            <div className="mt-4">
              <Button
                onClick={handleCheck}
                className="rounded-xl shadow-md bg-indigo-600 hover:bg-indigo-700 dark:bg-teal-600 dark:hover:bg-teal-700"
              >
                Check Answer
              </Button>
            </div>

            {checked && (
              <div
                className={cn(
                  "mt-4 flex items-start gap-2 rounded-xl border p-3 text-sm shadow-md",
                  isCorrect
                    ? "border-green-400/60 bg-green-50/70 dark:bg-green-900/20"
                    : "border-amber-400/60 bg-amber-50/70 dark:bg-amber-900/20",
                )}
                role="status"
                aria-live="polite"
              >
                <Info className="mt-0.5 h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                <div>
                  <p className="font-medium text-neutral-800 dark:text-neutral-100">
                    {isCorrect ? "Correct!" : "Not quite."}
                  </p>
                  <p className="text-neutral-700 dark:text-neutral-300">Explanation: {q.explanation}</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={index === 0}
              className="rounded-xl shadow-md bg-white dark:bg-neutral-900"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={goNext}
              disabled={index === total - 1}
              className="rounded-xl shadow-md bg-white dark:bg-neutral-900"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
