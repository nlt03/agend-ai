import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAgendaStore } from '../store/agendaStore'
import { BottomNav } from '../components/BottomNav'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor(diff / 3_600_000)
  const minutes = Math.floor(diff / 60_000)

  if (minutes < 1)  return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24)   return `${hours}h ago`
  if (days === 1)   return 'Yesterday'
  if (days <= 6)    return `${days} days ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function bodyPreview(body: string): string {
  return body.replace(/\n+/g, ' ').trim().slice(0, 90)
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function Notes() {
  const navigate = useNavigate()
  const notes = useAgendaStore((s) => s.notes)
  const addNote = useAgendaStore((s) => s.addNote)

  // Notes are already stored most-recent-first (addNote prepends); secondary
  // sort covers notes loaded from seed that may not be in insertion order.
  const sorted = [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )

  function handleNew() {
    const id = addNote({ title: '', body: '' })
    toast.success('Note created')
    navigate(`/notes/${id}`)
  }

  return (
    <div className="fixed inset-0 bg-surface flex justify-center">
      <div className="w-full max-w-sm flex flex-col h-full">

        <header className="bg-card px-5 pt-safe pb-4 shrink-0">
          <h1 className="text-h1 font-semibold text-text mt-3">Notes</h1>
        </header>

        <div className="relative flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto scrollbar-none px-4 py-3 pb-6">

            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                <p className="font-medium text-text">No notes yet</p>
                <p className="text-sm text-text-muted">Tap + to capture your first thought</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sorted.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => navigate(`/notes/${note.id}`)}
                    className="w-full text-left bg-card rounded-2xl px-4 py-4 space-y-1 shadow-card active:bg-surface transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium text-text truncate">
                        {note.title || 'Untitled'}
                      </span>
                      <span className="text-xs text-text-muted shrink-0">
                        {relativeDate(note.updatedAt)}
                      </span>
                    </div>
                    {note.body ? (
                      <p className="text-sm text-text-muted line-clamp-2 leading-relaxed">
                        {bodyPreview(note.body)}
                      </p>
                    ) : (
                      <p className="text-sm text-text-muted italic">No content</p>
                    )}
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* FAB */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleNew}
            aria-label="New note"
            className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/40"
          >
            <Plus size={24} strokeWidth={2} />
          </motion.button>
        </div>

        <BottomNav active="notes" />
      </div>
    </div>
  )
}
