"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { api } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft, Brain } from "lucide-react"

interface AuthResponse {
  user_id: string
  email: string
  message: string
  access_token?: string | null
  refresh_token?: string | null
}

export default function SignupPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const { data } = await api.post<AuthResponse>("/auth/signup", {
        email: formData.email,
        password: formData.password,
        metadata: {
          full_name: formData.name,
          username: formData.email.split("@")[0],
        },
      })

      if (data.access_token) {
        localStorage.setItem("auth_token", data.access_token)
      }

      const newUser = {
        id: data.user_id,
        email: data.email,
        name: formData.name || data.email.split("@")[0],
        role: "student" as const,
      }
      setUser(newUser)

      toast.success(data.message || "Account created successfully! Check your email to verify the account.")

      if (data.access_token) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    } catch (error: any) {
      const detail = error?.response?.data?.detail || error.message
      toast.error(detail || "Signup failed. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl opacity-30 animate-pulse" />
        </div>

        <Card className="glass w-full max-w-md p-8">
          <div className="space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent glow">
                  <Brain className="w-5 h-5 text-foreground" />
                </div>
                <h1 className="text-2xl font-bold gradient-text">Join EduNerve</h1>
              </div>
              <p className="text-sm text-muted-foreground">Start your learning journey today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-2 bg-white/5 border-white/20"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-2 bg-white/5 border-white/20"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-2 bg-white/5 border-white/20"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-2 bg-white/5 border-white/20"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 glow"
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Already have an account?</span>
              </div>
            </div>

            <Link href="/login">
              <Button
                variant="outline"
                className="w-full border-primary/50 text-foreground hover:bg-primary/10 bg-transparent"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </>
  )
}
