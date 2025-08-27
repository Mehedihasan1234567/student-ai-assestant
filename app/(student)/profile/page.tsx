"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [notify, setNotify] = React.useState<boolean>(() => localStorage.getItem("profile:notify") === "true")

  // Password form state
  const [currPwd, setCurrPwd] = React.useState("")
  const [newPwd, setNewPwd] = React.useState("")
  const [confirmPwd, setConfirmPwd] = React.useState("")

  React.useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const user = await res.json();
        setName(user.name || "");
        setEmail(user.email || "");
      }
    };
    fetchUser();
  }, []);

  const saveProfile = async () => {
    const res = await fetch("/api/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    if (res.ok) {
      toast({ title: "Saved", description: "Your profile has been updated." })
    } else {
      toast({ title: "Error", description: "Failed to update profile." })
    }
  }

  const changePassword = () => {
    if (!currPwd || !newPwd || !confirmPwd) {
      toast({ title: "Missing fields", description: "Please fill in all password fields." })
      return
    }
    if (newPwd !== confirmPwd) {
      toast({ title: "Mismatch", description: "New passwords do not match." })
      return
    }
    // Simulate success
    setCurrPwd("")
    setNewPwd("")
    setConfirmPwd("")
    toast({ title: "Password changed", description: "Your password has been updated." })
  }

  const upgrade = () => {
    toast({ title: "Upgrade to Premium", description: "Redirecting to billing..." })
    setTimeout(() => router.push("/billing"), 600)
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
      {/* Profile card */}
      <Card className="rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-neutral-900 dark:text-neutral-100">Profile</CardTitle>
          <CardDescription>Manage your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src="/placeholder.svg?height=96&width=96" alt="User avatar" />
              <AvatarFallback>ST</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">Logged in as</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{email}</p>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl shadow-md"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl shadow-md"
              />
            </div>
            <Button onClick={saveProfile} className="w-fit rounded-xl shadow-md">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings card */}
      <Card className="rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-neutral-900 dark:text-neutral-100">Settings</CardTitle>
          <CardDescription>Preferences and security.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border p-4 shadow-md">
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Notifications</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Get updates for summaries and quizzes.</p>
              </div>
              <Switch checked={notify} onCheckedChange={setNotify} />
            </div>
            <div className="flex items-center justify-between rounded-xl border p-4 shadow-md">
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Dark Mode</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Toggle light/dark theme.</p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
                aria-label="Toggle dark mode"
              />
            </div>
          </div>

          {/* Change password */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Change Password</p>
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="current">Current password</Label>
                <Input
                  id="current"
                  type="password"
                  value={currPwd}
                  onChange={(e) => setCurrPwd(e.target.value)}
                  className="rounded-xl shadow-md"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new">New password</Label>
                <Input
                  id="new"
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className="rounded-xl shadow-md"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  className="rounded-xl shadow-md"
                />
              </div>
              <Button onClick={changePassword} className="w-fit rounded-xl shadow-md">
                Update Password
              </Button>
            </div>
          </div>

          <div className="pt-2">
            <Button variant="outline" onClick={upgrade} className="rounded-xl shadow-md bg-white dark:bg-neutral-900">
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
