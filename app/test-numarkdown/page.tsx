"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, FileText } from "lucide-react"

export default function TestNuMarkdownPage() {
  const [prompt, setPrompt] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState("")
  const [response, setResponse] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [testType, setTestType] = React.useState<"text" | "image">("text")

  const handleTest = async () => {
    if (!prompt && !imageUrl) return

    setIsLoading(true)
    setResponse("")

    try {
      const body = testType === "image" 
        ? { imageUrl, prompt: prompt || "Extract all text from this image and convert it to markdown format." }
        : { prompt }

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      
      if (Array.isArray(data) && data[0]?.generated_text) {
        setResponse(data[0].generated_text)
      } else {
        setResponse("Error: " + JSON.stringify(data))
      }
    } catch (error) {
      setResponse("Error: " + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Local AI Processing Test</CardTitle>
          <CardDescription>
            Test the local AI processing for text generation and document analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Type Selection */}
          <div className="flex gap-4">
            <Button
              variant={testType === "text" ? "default" : "outline"}
              onClick={() => setTestType("text")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Text Generation
            </Button>
            <Button
              variant={testType === "image" ? "default" : "outline"}
              onClick={() => setTestType("image")}
            >
              <Upload className="h-4 w-4 mr-2" />
              Image to Text
            </Button>
          </div>

          {/* Input Fields */}
          {testType === "image" && (
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="prompt">
              {testType === "image" ? "Prompt (optional)" : "Text Prompt"}
            </Label>
            <Textarea
              id="prompt"
              placeholder={
                testType === "image" 
                  ? "Optional: Describe what you want to extract from the image"
                  : "Enter your text prompt here..."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={handleTest} disabled={isLoading || (!prompt && !imageUrl)}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Test Model"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Response */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Model Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto rounded-lg border p-4 bg-neutral-50 dark:bg-neutral-800">
              <pre className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                {response}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample Test Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Test Cases</CardTitle>
          <CardDescription>Try these examples to test the model</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Text Generation Test</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                "Explain the concept of machine learning in simple terms"
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setTestType("text")
                  setPrompt("Explain the concept of machine learning in simple terms")
                }}
              >
                Use This Prompt
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Image to Text Test</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                Use any publicly accessible image URL
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setTestType("image")
                  setImageUrl("https://via.placeholder.com/400x300/000000/FFFFFF?text=Sample+Text+Image")
                  setPrompt("Extract all text from this image")
                }}
              >
                Use Sample Image
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}