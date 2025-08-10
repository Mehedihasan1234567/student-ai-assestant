"use client"

import { useTheme } from "next-themes"
import { MoonStar, SunMedium } from "lucide-react"
import { Button } from "@/components/ui/button"
import * as React from "react"

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  const toggle = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  return (
    <Button
      aria-label="Toggle theme"
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={`rounded-xl shadow-md hover:shadow-lg transition ${className}`}
    >
      <SunMedium className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-600 dark:text-teal-400" />
      <MoonStar className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-600 dark:text-teal-400" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
