import { useEffect, useRef, useState } from 'react'
import { useAssistant } from '../contexts/AssistantContext'

const TODAY = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const SAMPLE_EVENTS = [
  { id: 1, time: '9:00 AM', title: 'Team standup', duration: '30 min', dot: 'bg-label-cyan', card: 'bg-label-cyan/20 border-label-cyan' },
  { id: 2, time: '12:30 PM', title: 'Lunch with design team', duration: '1 hr', dot: 'bg-label-green', card: 'bg-label-green/20 border-label-green' },
  { id: 3, time: '3:00 PM', title: 'Sprint review', duration: '1 hr', dot: 'bg-label-purple', card: 'bg-label-purple/20 border-label-purple' },
  { id: 4, time: '4:30 PM', title: 'Focus block — deep work', duration: '90 min', dot: 'bg-label-orange', card: 'bg-label-orange/20 border-label-orange' },
]

export default function Agenda() {
  const { assistant } = useAssistant()
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || streaming || !assistant) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text }])
    setStreaming(true)

    let accumulated = ''
    setMessages((m) => [...m, { role: 'assistant', text: '' }])

    await assistant.generate(text, {
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
        <h2 className="text-lg font-medium mb-1">{TODAY}</h2>
        <p className="text-sm text-text-muted mb-3">{SAMPLE_EVENTS.length} events</p>
        <div className="space-y-2">
          {SAMPLE_EVENTS.map((ev) => (
            <div
              key={ev.id}
              className={`border rounded-lg px-4 py-3 ${ev.card}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.dot}`} />
                  <span className="font-medium text-text">{ev.title}</span>
                </div>
                <span className="text-xs text-text-muted">{ev.duration}</span>
              </div>
              <div className="text-sm text-text-muted mt-0.5 ml-4">{ev.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Assistant panel */}
      <div className="flex flex-col border border-surface rounded-xl bg-white overflow-hidden h-[500px]">
        <div className="px-4 py-3 border-b border-surface bg-surface">
          <span className="font-medium text-sm text-text">AI Assistant</span>
          <span className="ml-2 text-xs text-text-muted">(mock)</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-sm text-text-muted text-center mt-8">
              Ask me about your schedule…
            </p>
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
        <div className="border-t border-surface p-3 flex gap-2">
          <input
            className="flex-1 text-sm border border-surface rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-soft bg-white text-text placeholder:text-text-muted"
            placeholder="Ask about your schedule…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={streaming}
          />
          <button
            onClick={handleSend}
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
