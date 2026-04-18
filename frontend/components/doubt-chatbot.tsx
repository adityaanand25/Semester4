"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageSquare, X, Send, Loader2, Bot, User, Lightbulb } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE;

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  practiceQuestion?: string
  difficultyLevel?: string
}

const formatContent = (content: string) => {
  // Split content into sections based on markdown-like formatting
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
    if (line.trim().startsWith('•')) {
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

export function DoubtChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "👋 Hi! I'm your Learning Assistant AI. I help you deeply understand concepts about programming, data structures, algorithms, and more!\n\nAsk me anything like:\n• 'Explain arrays for beginners'\n• 'What is recursion?'\n• 'How do hash tables work?'\n\nI'll break it down step-by-step with examples and practice questions! 🚀",
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
      if (!API_BASE_URL) {
        throw new Error("API_BASE_URL is not configured. Check .env.local file.")
      }

      const response = await fetch(`${API_BASE_URL}/doubts/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_history: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          practiceQuestion: data.practice_question,
          difficultyLevel: data.difficulty_level
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        const errorData = await response.text()
        throw new Error(`API Error: ${response.status} - ${errorData}`)
      }
    } catch (error) {
      console.error("Chatbot Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again or rephrase your question! 🤔",
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

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[650px] shadow-2xl z-50 flex flex-col rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Learning Assistant</h3>
                <p className="text-xs text-white/80">Learn deeply, not just answers</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none"
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
                    <div className="mt-3 p-2 bg-yellow-50 border-l-2 border-yellow-400 rounded">
                      <p className="text-xs font-semibold text-yellow-800">✓ Try this:</p>
                      <p className="text-xs text-yellow-700 mt-1">{message.practiceQuestion}</p>
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
                <div className="h-7 w-7 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={loading}
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3"
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
