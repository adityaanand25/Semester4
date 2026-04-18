"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, Loader2, Bot, User, Sparkles, ChevronDown, ChevronUp } from "lucide-react"
import { api } from "@/lib/api"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  practiceQuestion?: string
  difficultyLevel?: string
  suggestion?: string
  suggestions?: string[]
}

interface LearningAgentProps {
  weakTopics?: string[]
  readinessScore?: number
  nextWeekGoal?: string
}

const formatContent = (content: string) => {
  return content.split('\n').map((line, idx) => {
    if (line.includes('**') && line.includes(':')) {
      const [label, ...rest] = line.split(':')
      return (
        <div key={idx} className="mt-2 mb-1">
          <span className="font-semibold text-sm">{label.replace(/\*\*/g, '')}</span>
          <span className="text-sm">{rest.join(':')}</span>
        </div>
      )
    }
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      return (
        <div key={idx} className="ml-4 text-sm py-1">
          {line}
        </div>
      )
    }
    if (line.trim()) {
      return (
        <p key={idx} className="text-sm py-1">
          {line}
        </p>
      )
    }
    return <div key={idx} className="h-1" />
  })
}

export function LearningAgent({ weakTopics, readinessScore, nextWeekGoal }: LearningAgentProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `🎯 Hello! I'm your Learning Coach. Based on your current progress:\n\n• Readiness Score: ${readinessScore || 0}\n• Weak Topics: ${weakTopics?.join(", ") || "None identified yet"}\n• This Week's Goal: ${nextWeekGoal || "Build strong fundamentals"}\n\nI'm here to help you succeed! Ask me about:\n• Study strategies for your weak topics\n• How to approach this week's goals\n• Tips for improving specific areas\n• Practice problem recommendations`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await api.post("/doubts/chat", {
        message: userMessage.content,
        conversation_history: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        weak_topics: weakTopics || [],
        readiness_score: readinessScore || 0,
        learning_goal: nextWeekGoal || "General learning"
      })

      if (response.status === 200) {
        const data = response.data
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          practiceQuestion: data.practice_question,
          difficultyLevel: data.difficulty_level,
          suggestions: data.suggestions
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error: any) {
      console.error("Learning Agent Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error.response?.data?.detail || "I'm having trouble connecting right now. Please try again! 🤔",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestedQuestions = [
    "How should I study " + (weakTopics?.[0] || "better"),
    "What's the best approach for this week?",
    "Give me a study plan"
  ]

  return (
    <Card className="border border-border/50 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600 to-emerald-600 cursor-pointer hover:from-green-700 hover:to-emerald-700 transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Learning Coach</h3>
            <p className="text-xs text-white/80">Personalized guidance for your success</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Chat Content */}
      {isExpanded && (
        <>
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-xs rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-br-none"
                      : "bg-white border border-slate-200 text-slate-900 rounded-bl-none"
                  }`}
                >
                  <div className="text-sm leading-relaxed">
                    {message.role === "user" ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="space-y-1">
                        {formatContent(message.content)}
                      </div>
                    )}
                  </div>

                  {/* Practice Question */}
                  {message.practiceQuestion && (
                    <div className="mt-3 p-2 bg-green-50 border-l-2 border-green-400 rounded">
                      <p className="text-xs font-semibold text-green-800">💡 Try this:</p>
                      <p className="text-xs text-green-700 mt-1">{message.practiceQuestion}</p>
                    </div>
                  )}

                  {/* Difficulty Badge */}
                  {message.difficultyLevel && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-xs font-medium text-slate-600">Level: </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        message.difficultyLevel === "beginner" ? "bg-green-100 text-green-700" :
                        message.difficultyLevel === "intermediate" ? "bg-blue-100 text-blue-700" :
                        "bg-purple-100 text-purple-700"
                      }`}>
                        {message.difficultyLevel}
                      </span>
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 p-2 bg-emerald-50 border-l-2 border-emerald-400 rounded">
                      <p className="text-xs font-semibold text-emerald-800">📚 Suggested next steps:</p>
                      <div className="mt-1 space-y-1">
                        {message.suggestions.map((suggestion, idx) => (
                          <p key={idx} className="text-xs text-emerald-700">• {suggestion}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs mt-2 opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="h-7 w-7 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {!messages.some(m => m.role === "user") && (
            <div className="px-4 py-3 border-t bg-white space-y-2">
              <p className="text-xs font-medium text-slate-600">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(question)
                    }}
                    className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your learning coach..."
                disabled={loading}
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3"
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
