import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useAgendaStore } from '../store/agendaStore'
import { useAssistant } from '../contexts/AssistantContext'
import { NOTE_PREFIX_SUMMARIZE, NOTE_PREFIX_REWRITE, NOTE_PREFIX_KEYPOINTS } from '../ai'

// ---------------------------------------------------------------------------
// Typing indicator (inline — avoids creating a shared component file)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// AI chip config — Summarize / Rewrite / Key points wired; Translate visual-only
// ---------------------------------------------------------------------------

const AI_CHIPS = [
  { label: 'Summarize',  prefix: NOTE_PREFIX_SUMMARIZE  },
  { label: 'Rewrite',    prefix: NOTE_PREFIX_REWRITE    },
  { label: 'Key points', prefix: NOTE_PREFIX_KEYPOINTS  },
  { label: 'Translate',  prefix: null }, // visual-only — parked in FUTURE.md
] as const

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { assistant } = useAssistant()

  const notes      = useAgendaStore((s) => s.notes)
  const updateNote = useAgendaStore((s) => s.updateNote)
  const deleteNote = useAgendaStore((s) => s.deleteNote)

  const note = notes.find((n) => n.id === id)

  const [title, setTitle] = useState(note?.title ?? '')
  const [body,  setBody]  = useState(note?.body ?? '')

  // AI panel state
  const [activeChip,  setActiveChip]  = useState<string | null>(null)
  const [aiResult,    setAiResult]    = useState('')
  const [aiStreaming, setAiStreaming] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [body])

  // Persist title on change
  useEffect(() => {
    if (!id) return
    updateNote(id, { title })
  }, [title]) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist body on change
  useEffect(() => {
    if (!id) return
    updateNote(id, { body })
  }, [body]) // eslint-disable-line react-hooks/exhaustive-deps

  // Navigate away if the note was deleted externally
  useEffect(() => {
    if (!note) navigate('/notes', { replace: true })
  }, [note, navigate])

  function handleDelete() {
    if (!id) return
    deleteNote(id)
    navigate('/notes', { replace: true })
  }

  async function runChip(label: string, prefix: string | null) {
    if (!prefix) return // visual-only chip
    if (!assistant || aiStreaming) return

    setActiveChip(label)
    setAiResult('')
    setAiStreaming(true)

    await assistant.generate(`${prefix}${body}`, {
      onToken: (t) => setAiResult((r) => r + t),
    })

    setAiStreaming(false)
  }

  if (!note) return null

  return (
    <div className="fixed inset-0 bg-card flex justify-center">
      <div className="w-full max-w-sm flex flex-col h-full">

        {/* Header */}
        <header className="bg-card border-b border-surface px-4 pt-safe pb-3 flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/notes')}
            aria-label="Back to notes"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-surface transition-colors shrink-0"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>

          <input
            className="flex-1 text-base font-semibold text-text bg-transparent outline-none placeholder:text-text-muted"
            placeholder="Untitled"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <button
            onClick={handleDelete}
            aria-label="Delete note"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:text-error hover:bg-error/10 transition-colors shrink-0"
          >
            <Trash2 size={18} strokeWidth={1.5} />
          </button>
        </header>

        {/* Body — scrollable, auto-grow textarea */}
        <div className="flex-1 overflow-y-auto scrollbar-none px-5 py-4">
          <textarea
            ref={textareaRef}
            className="w-full text-sm text-text placeholder:text-text-muted outline-none resize-none leading-relaxed bg-transparent"
            placeholder="Start writing…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={{ minHeight: '60vh' }}
          />
        </div>

        {/* AI chip bar */}
        <div className="border-t border-surface bg-card px-4 pt-3 pb-safe shrink-0 space-y-3">

          {/* AI result panel */}
          {(aiResult || aiStreaming) && (
            <div className="bg-surface rounded-2xl px-4 py-3 text-sm text-text whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto scrollbar-none">
              {aiStreaming && !aiResult ? (
                <ThinkingDots />
              ) : (
                <>
                  {aiResult}
                  {aiStreaming && (
                    <span className="inline-block w-1 h-3.5 bg-text-muted ml-0.5 animate-pulse align-text-bottom" />
                  )}
                </>
              )}
            </div>
          )}

          {/* Chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
            {AI_CHIPS.map(({ label, prefix }) => {
              const isActive  = activeChip === label
              const isVisual  = prefix === null
              return (
                <button
                  key={label}
                  onClick={() => runChip(label, prefix)}
                  disabled={isVisual || aiStreaming}
                  title={isVisual ? 'Coming soon' : undefined}
                  className={`shrink-0 text-xs px-3.5 py-2 rounded-full border-2 font-medium transition-colors ${
                    isVisual
                      ? 'bg-surface border-transparent text-text-muted/50 cursor-default'
                      : isActive && (aiStreaming || aiResult)
                      ? 'bg-primary/10 border-primary/40 text-primary'
                      : 'bg-surface border-transparent text-text-muted hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

        </div>

      </div>
    </div>
  )
}
