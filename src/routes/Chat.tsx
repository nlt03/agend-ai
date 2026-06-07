import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Send } from 'lucide-react'
import { useAssistant } from '../contexts/AssistantContext'
import { SUGGESTIONS } from '../ai'

interface Message {
  role: 'user' | 'assistant'
  text: string
  thinking?: boolean // true while 400–800ms delay is running
}

// Typing indicator — three bouncing dots
function ThinkingDots() {
  return (
    <span className="flex items-center gap-1 h-5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  )
}

export default function Chat() {
  const navigate = useNavigate()
  const location = useLocation()
  const { assistant } = useAssistant()

  const initialPrompt = (location.state as { initialPrompt?: string } | null)
    ?.initialPrompt

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const didAutoSend = useRef(false)

  // Auto-scroll on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-send the initial prompt (passed from home chips or AI entry)
  useEffect(() => {
    if (initialPrompt && assistant && !didAutoSend.current) {
      didAutoSend.current = true
      void handleSend(initialPrompt)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assistant])

  async function handleSend(prompt?: string) {
    const text = (prompt ?? input).trim()
    if (!text || streaming || !assistant) return
    setInput('')

    setMessages((m) => [...m, { role: 'user', text }])
    // Show thinking indicator immediately
    setMessages((m) => [...m, { role: 'assistant', text: '', thinking: true }])
    setStreaming(true)

    let accumulated = ''
    await assistant.generate(text, {
      onToken: (token) => {
        accumulated += token
        setMessages((m) => {
          const next = [...m]
          next[next.length - 1] = { role: 'assistant', text: accumulated, thinking: false }
          return next
        })
      },
    })

    setStreaming(false)
    // Return focus to input after answer lands
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function resetChat() {
    setMessages([])
    setInput('')
    setStreaming(false)
    didAutoSend.current = false
    inputRef.current?.focus()
  }

  return (
    <div className="fixed inset-0 bg-white flex justify-center">
      <div className="w-full max-w-sm flex flex-col h-full">

        {/* Header */}
        <header className="bg-white border-b border-surface px-4 pt-safe pb-3 flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-surface transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <div className="flex-1">
            <p className="font-semibold text-text">AI Assistant</p>
            <p className="text-xs text-text-muted">Ask anything about your schedule</p>
          </div>
          <button
            onClick={resetChat}
            aria-label="New chat"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-surface transition-colors"
          >
            <RotateCcw size={18} strokeWidth={1.5} />
          </button>
        </header>

        {/* Messages / empty state */}
        <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-5 px-2">
              <div className="text-center space-y-1">
                <p className="font-semibold text-text">How can I help you?</p>
                <p className="text-sm text-text-muted">Tap a suggestion or type your own</p>
              </div>
              <div className="w-full space-y-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    disabled={streaming}
                    className="w-full text-left text-sm px-4 py-3 rounded-2xl bg-surface text-text-muted hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-primary text-white rounded-br-sm font-medium'
                        : 'bg-surface text-text rounded-bl-sm'
                    }`}
                  >
                    {m.thinking ? <ThinkingDots /> : m.text}
                    {/* Streaming cursor */}
                    {streaming &&
                      !m.thinking &&
                      i === messages.length - 1 &&
                      m.role === 'assistant' && (
                        <span className="inline-block w-1.5 h-3.5 bg-text-muted ml-0.5 animate-pulse align-text-bottom" />
                      )}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="bg-white border-t border-surface px-4 py-3 pb-safe shrink-0">
          <div className="flex items-center gap-2 bg-surface rounded-2xl pl-4 pr-2 py-2">
            <input
              ref={inputRef}
              className="flex-1 text-sm bg-transparent text-text placeholder:text-text-muted outline-none"
              placeholder="Ask about your schedule…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={streaming}
            />
            <button
              onClick={() => handleSend()}
              disabled={streaming || !input.trim()}
              aria-label="Send"
              className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 transition-opacity shrink-0"
            >
              <Send size={15} strokeWidth={2} />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
