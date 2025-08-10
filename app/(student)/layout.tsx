import type { ReactNode } from "react"
import { Inter } from "next/font/google"
import { TopNav } from "@/components/top-nav"
import { AppSidebar } from "@/components/app-sidebar"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <div className={cn(inter.variable, "font-sans")}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-neutral-950 dark:to-neutral-900">
        <AppSidebar />
        <div className="md:ml-64 flex min-h-screen flex-col">
          <TopNav />
          <main className="flex-1 p-4 sm:p-6">
            <div className="mx-auto max-w-screen-2xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
