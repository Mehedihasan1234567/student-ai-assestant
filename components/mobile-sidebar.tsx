"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { navItems } from "./nav-items"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MobileSidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("md:hidden rounded-xl shadow-md hover:shadow-lg", className)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="px-4 py-3">
          <SheetTitle>
            <span className="inline-flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-500 shadow" />
              <span className="font-semibold">StudyMate</span>
            </span>
          </SheetTitle>
        </SheetHeader>
        <nav className="px-2 py-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl p-2 text-sm transition",
                      "hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:bg-teal-500/10 dark:hover:text-teal-300",
                      isActive
                        ? "bg-indigo-500/15 text-indigo-700 dark:bg-teal-500/15 dark:text-teal-200 shadow-md"
                        : "text-neutral-700 dark:text-neutral-300",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4",
                        isActive ? "text-indigo-600 dark:text-teal-400" : "text-neutral-500 dark:text-neutral-400",
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
