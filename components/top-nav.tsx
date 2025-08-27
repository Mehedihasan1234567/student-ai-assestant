"use client"

import * as React from "react"
import { GraduationCap } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MobileSidebar } from "./mobile-sidebar"

export function TopNav({ className = "" }: { className?: string }) {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    };
    fetchUser();
  }, []);

  return (
    <header
      className={`sticky top-0 z-20 w-full border-b bg-white/70 dark:bg-neutral-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-neutral-900/60 shadow-md ${className}`}
      role="banner"
    >
      <div className="flex h-16 items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <MobileSidebar />
          <span className="hidden md:inline-flex items-center gap-2 rounded-xl px-2 py-1">
            <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-teal-400" />
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">StudyMate</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" className="rounded-xl">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image} alt={user?.name} />
              <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Open profile</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
