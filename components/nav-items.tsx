import { Home, Upload, Sparkles, ListChecks, History, UserRound, Bot, type LucideIcon } from "lucide-react"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Upload Notes", href: "/upload-notes", icon: Upload },
  { label: "AI Agent", href: "/ai-agent", icon: Bot },
  { label: "AI Summaries", href: "/ai-summaries", icon: Sparkles },
  { label: "Quizzes", href: "/quizzes", icon: ListChecks },
  { label: "History", href: "/history", icon: History },
  { label: "Profile", href: "/profile", icon: UserRound },
]
