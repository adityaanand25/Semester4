"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/lib/store"
import { useEffect, useState } from "react"
import { systemAPI } from "@/lib/api"

export default function Home() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking")
  const targetCompanies = [
    { name: "PhonePe", logo: "https://cdn.simpleicons.org/phonepe" },
    { name: "Google", logo: "https://cdn.simpleicons.org/google" },
    { name: "Amazon", logo: "https://logo.clearbit.com/amazon.com" },
    { name: "Disney+ Hotstar", logo: "https://logo.clearbit.com/hotstar.com" },
    { name: "OYO", logo: "https://cdn.simpleicons.org/oyo" },
    { name: "Goldman Sachs", logo: "https://cdn.simpleicons.org/goldmansachs" },
    { name: "Flipkart", logo: "https://cdn.simpleicons.org/flipkart" },
    { name: "Media.net", logo: "https://cdn.simpleicons.org/medianet" },
    { name: "Walmart", logo: "https://cdn.simpleicons.org/walmart" },
  ]
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let ignore = false

    const checkHealth = async () => {
      try {
        const response = await systemAPI.getHealth()
        if (!ignore) {
          setBackendStatus(response.status === "ok" ? "online" : "offline")
        }
      } catch {
        if (!ignore) {
          setBackendStatus("offline")
        }
      }
    }

    checkHealth()

    return () => {
      ignore = true
    }
  }, [])

  if (!mounted) return null

  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center relative overflow-hidden hero-bg">
          {/* Background gradient effects */}
          <div className="absolute inset-0 -z-10 bg-black/60" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold gradient-text text-balance">
                  Learn Smart.
                  Assess Deep. 
                  Interview Ready.
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                  Intelligent learning platform powered by AI. Personalized recommendations, adaptive quizzes, and
                  interview preparation all in one place.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-linear-to-r from-primary to-accent hover:opacity-90 glow">
                      Go to Dashboard
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button size="lg" className="bg-linear-to-r from-primary to-accent hover:opacity-90 glow">
                        Get Started
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-primary/50 text-foreground hover:bg-primary/10 bg-transparent"
                      >
                        Explore Demo
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text">Why Choose EduNerve?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: "AI-Powered Learning",
                  description: "Personalized learning paths adapted to your pace and style",
                },
                {
                  title: "Smart Assessments",
                  description: "Adaptive quizzes that evolve based on your performance",
                },
                {
                  title: "Interview Ready",
                  description: "Practice with AI interviewer and get real-time feedback",
                },
                {
                  title: "Community Support",
                  description: "Learn with peers and get guidance from mentors",
                },
              ].map((feature, i) => (
                <div key={i} className="glass p-8 group hover:bg-white/15 transition-all">
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
            <p className="mt-10 text-center text-sm md:text-base text-muted-foreground">
              Prepare for companies like these:
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {targetCompanies.map((company) => (
                <div
                  key={company.name}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5"
                >
                  {failedLogos[company.name] ? (
                    <div className="flex h-[18px] w-[18px] items-center justify-center rounded-sm bg-white text-[9px] font-semibold text-black">
                      {company.name.slice(0, 1)}
                    </div>
                  ) : (
                    <img
                      src={company.logo}
                      alt={`${company.name} logo`}
                      width={18}
                      height={18}
                      className="rounded-sm bg-white p-0.5"
                      onError={() => {
                        setFailedLogos((prev) => ({ ...prev, [company.name]: true }))
                      }}
                    />
                  )}
                  <span className="text-sm md:text-base text-foreground">{company.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="glass p-8 md:p-10 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold gradient-text">Built For Career Outcomes</h2>
                  <p className="text-muted-foreground mt-2 max-w-2xl">
                    Not just lessons. You get measurable progress, strategic guidance, and interview execution support in one workflow.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 w-fit">
                  <span className={`h-2.5 w-2.5 rounded-full ${backendStatus === "online" ? "bg-emerald-400" : backendStatus === "offline" ? "bg-red-400" : "bg-amber-400"}`} />
                  <span className="text-sm text-muted-foreground">
                    Backend status: {backendStatus === "checking" ? "Checking" : backendStatus === "online" ? "Online" : "Offline"}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-white/15 bg-white/5 p-5">
                  <p className="text-sm text-muted-foreground">Execution Stack</p>
                  <p className="text-2xl font-bold mt-2">Learning + Quiz + Interview</p>
                  <p className="text-sm text-muted-foreground mt-2">A complete preparation loop instead of disconnected tools.</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/5 p-5">
                  <p className="text-sm text-muted-foreground">Decision Intelligence</p>
                  <p className="text-2xl font-bold mt-2">AI Recommendations</p>
                  <p className="text-sm text-muted-foreground mt-2">Personalized recommendations adapt to your ongoing performance.</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/5 p-5">
                  <p className="text-sm text-muted-foreground">Career Proof</p>
                  <p className="text-2xl font-bold mt-2">Resume + Certificate Pipeline</p>
                  <p className="text-sm text-muted-foreground mt-2">Turn practice into profile strength with verified artifacts.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
