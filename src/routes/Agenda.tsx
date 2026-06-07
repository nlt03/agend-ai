import { useEffect, useRef, useState } from 'react'
import { useAssistant } from '../contexts/AssistantContext'
import { useAgendaStore, CATEGORY_COLORS } from '../store/agendaStore'
import { SUGGESTIONS } from '../ai'

const TODAY_LABEL = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default function Agenda() {
  const { assistant } = useAssistant()

  // Live events from store — re-renders when any event changes.
  const events = useAgendaStore((s) => s.events)
  const today = new Date()
  const todayStr = today.toDateString()
  const todayEvents = events
    .filter((e) => new Date(e.start).toDateString() === todayStr)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(text?: string) {
    const prompt = (text ?? input).trim()
    if (!prompt || streaming || !assistant) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text: prompt }])
    setStreaming(true)

    let accumulated = ''
    setMessages((m) => [...m, { role: 'assistant', text: '' }])

    await assistant.generate(prompt, {
      onToken: (token) => {
        accumulated += token
        setMessages((m) => {
          const next = [...m]
          next[next.length - 1] = { role: 'assistant', text: accumulated }
          return next
        })
      },
    })

    setStreaming(false)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {/* Agenda panel */}
      <div>
        <h2 className="text-lg font-medium mb-1">{TODAY_LABEL}</h2>
        <p className="text-sm text-text-muted mb-3">
          {todayEvents.length} event{todayEvents.length !== 1 ? 's' : ''} today
        </p>

        {todayEvents.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-10">Nothing scheduled today</p>
        ) : (
          <div className="space-y-2">
            {todayEvents.map((ev) => {
              const c = CATEGORY_COLORS[ev.category]
              return (
                <div
                  key={ev.id}
                  className={`border-l-4 rounded-lg px-4 py-3 ${c.card} ${c.border}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                      <span className="font-medium text-text">{ev.title}</span>
                    </div>
                    <span className="text-xs text-text-muted">{ev.durationMin} min</span>
                  </div>
                  <div className="text-sm text-text-muted mt-0.5 ml-4">{fmtTime(ev.start)}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Assistant panel */}
      <div className="flex flex-col border border-surface rounded-xl bg-white overflow-hidden h-[500px]">
        <div className="px-4 py-3 border-b border-surface bg-surface shrink-0">
          <span className="font-medium text-sm text-text">AI Assistant</span>
          <span className="ml-2 text-xs text-text-muted">(mock)</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-text-muted text-center mb-3">Try asking…</p>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  disabled={streaming}
                  className="w-full text-left text-sm px-3 py-2 rounded-lg bg-surface text-text-muted hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`text-sm rounded-lg px-3 py-2 max-w-[90%] whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-primary text-white ml-auto'
                  : 'bg-surface text-text'
              }`}
            >
              {m.text}
              {streaming && i === messages.length - 1 && m.role === 'assistant' && (
                <span className="inline-block w-1.5 h-3.5 bg-text-muted ml-0.5 animate-pulse" />
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="border-t border-surface p-3 flex gap-2 shrink-0">
          <input
            className="flex-1 text-sm border border-surface rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-soft bg-white text-text placeholder:text-text-muted"
            placeholder="Ask about your schedule…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={streaming}
          />
          <button
            onClick={() => handleSend()}
            disabled={streaming || !input.trim()}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
