import { useEffect, useRef, useState } from 'react'
import { createAssistant, type Assistant } from '../ai'

const TODAY = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const SAMPLE_EVENTS = [
  { id: 1, time: '9:00 AM', title: 'Team standup', duration: '30 min', color: 'bg-blue-100 border-blue-300' },
  { id: 2, time: '12:30 PM', title: 'Lunch with design team', duration: '1 hr', color: 'bg-green-100 border-green-300' },
  { id: 3, time: '3:00 PM', title: 'Sprint review', duration: '1 hr', color: 'bg-purple-100 border-purple-300' },
  { id: 4, time: '4:30 PM', title: 'Focus block — deep work', duration: '90 min', color: 'bg-yellow-100 border-yellow-300' },
]

export default function Agenda() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const assistantRef = useRef<Assistant | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    createAssistant().then((a) => {
      assistantRef.current = a
      a.init?.()
    })
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || streaming) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text }])
    setStreaming(true)

    const assistant = assistantRef.current!
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
        <h2 className="text-lg font-semibold mb-1">{TODAY}</h2>
        <p className="text-sm text-gray-500 mb-3">{SAMPLE_EVENTS.length} events</p>
        <div className="space-y-2">
          {SAMPLE_EVENTS.map((ev) => (
            <div
              key={ev.id}
              className={`border rounded-lg px-4 py-3 ${ev.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{ev.title}</span>
                <span className="text-xs text-gray-500">{ev.duration}</span>
              </div>
              <div className="text-sm text-gray-600 mt-0.5">{ev.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Assistant panel */}
      <div className="flex flex-col border border-gray-200 rounded-xl bg-white overflow-hidden h-[500px]">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <span className="font-medium text-sm">AI Assistant</span>
          <span className="ml-2 text-xs text-gray-400">(mock)</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-sm text-gray-400 text-center mt-8">
              Ask me about your schedule…
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`text-sm rounded-lg px-3 py-2 max-w-[90%] whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white ml-auto'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {m.text}
              {streaming && i === messages.length - 1 && m.role === 'assistant' && (
                <span className="inline-block w-1.5 h-3.5 bg-gray-400 ml-0.5 animate-pulse" />
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="border-t border-gray-100 p-3 flex gap-2">
          <input
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Ask about your schedule…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={streaming}
          />
          <button
            onClick={handleSend}
            disabled={streaming || !input.trim()}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg disabled:opacity-40 hover:bg-indigo-700 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
