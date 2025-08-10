import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AISummariesPage() {
  return (
    <Card className="rounded-xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-neutral-900 dark:text-neutral-100">AI Summaries</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border p-4 shadow-md">
          <p className="text-sm font-medium text-indigo-700 dark:text-teal-300">Chemistry: Bonding</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Covalent vs ionic bonds, examples, and key equations.
          </p>
        </div>
        <div className="rounded-xl border p-4 shadow-md">
          <p className="text-sm font-medium text-indigo-700 dark:text-teal-300">History: Renaissance</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Humanism, art, and scientific breakthroughs.</p>
        </div>
      </CardContent>
    </Card>
  )
}
