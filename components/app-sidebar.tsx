"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navItems } from "./nav-items"
import { cn } from "@/lib/utils"
import { StudyMateLogoSimple } from "./icons/studymate-logo-simple"
import {StudyMateLogo} from "./icons/studymate-logo"

export function AppSidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname()

  return (
    <aside
      aria-label="Primary"
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden md:flex w-64 flex-col border-r bg-white/70 dark:bg-neutral-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-neutral-900/60",
        "shadow-lg rounded-r-xl",
        className,
      )}
    >
      <div className="px-4 pb-2 pt-4">
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-3 border border-purple-200/20 dark:border-purple-700/20">
          <StudyMateLogo size={36} className="flex-shrink-0" />
          <div className="leading-tight">
            <p className="font-bold text-neutral-900 dark:text-neutral-100 text-base">StudyMate</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">🤖 AI Study Assistant</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl p-2 text-sm transition-all duration-200",
                    "hover:bg-purple-500/10 hover:text-purple-700 dark:hover:bg-purple-500/10 dark:hover:text-purple-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 dark:focus-visible:ring-purple-400",
                    isActive
                      ? "bg-gradient-to-r from-purple-500/15 to-indigo-500/15 text-purple-700 dark:bg-gradient-to-r dark:from-purple-500/15 dark:to-indigo-500/15 dark:text-purple-200 shadow-md border border-purple-200/30 dark:border-purple-700/30"
                      : "text-neutral-700 dark:text-neutral-300",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-colors duration-200",
                      isActive
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-neutral-500 dark:text-neutral-400 group-hover:text-purple-600 dark:group-hover:text-purple-400",
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="px-3 pb-4 pt-2">
        <div className="rounded-xl border border-purple-200/30 dark:border-purple-700/30 p-3 text-xs bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/20 shadow-md">
          <p className="font-medium mb-1 text-purple-800 dark:text-purple-200 flex items-center gap-1">
            💡 Pro Tip
          </p>
          <p className="text-purple-600 dark:text-purple-400">Upload PDFs or images to generate AI-powered summaries and quizzes instantly!</p>
        </div>
      </div>
    </aside>
  )
}
