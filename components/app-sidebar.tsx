"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navItems } from "./nav-items"
import { cn } from "@/lib/utils"

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
        <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500/10 to-teal-500/10 p-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 shadow-md" />
          <div className="leading-tight">
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">StudyMate</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">AI Study Assistant</p>
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
                    "group flex items-center gap-3 rounded-xl p-2 text-sm transition",
                    "hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:bg-teal-500/10 dark:hover:text-teal-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:focus-visible:ring-teal-400",
                    isActive
                      ? "bg-indigo-500/15 text-indigo-700 dark:bg-teal-500/15 dark:text-teal-200 shadow-md"
                      : "text-neutral-700 dark:text-neutral-300",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      isActive
                        ? "text-indigo-600 dark:text-teal-400"
                        : "text-neutral-500 dark:text-neutral-400 group-hover:text-indigo-600 dark:group-hover:text-teal-400",
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
        <div className="rounded-xl border p-3 text-xs text-neutral-600 dark:text-neutral-300 shadow-md">
          <p className="font-medium mb-1 text-neutral-800 dark:text-neutral-100">Tip</p>
          <p className="text-neutral-500 dark:text-neutral-400">Press Cmd/Ctrl + K to quickly search notes.</p>
        </div>
      </div>
    </aside>
  )
}
