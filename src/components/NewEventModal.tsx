import { useState } from 'react'
import { X, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAgendaStore } from '../store/agendaStore'
import type { EventCategory } from '../store/agendaStore'

interface Props {
  initialDate: Date
  onClose: () => void
}

// Category chips — all use tint bg + dark text to satisfy 2a AA rules.
// personal/purple: tint-only — never dark text on full-saturation fill at small size.
const CATEGORIES: {
  id: EventCategory
  label: string
  dot: string
  selectedBg: string
  selectedBorder: string
}[] = [
  { id: 'work',     label: 'Work',     dot: 'bg-label-cyan',    selectedBg: 'bg-label-cyan/20',    selectedBorder: 'border-label-cyan/60' },
  { id: 'school',   label: 'School',   dot: 'bg-label-pink',    selectedBg: 'bg-label-pink/15',    selectedBorder: 'border-label-pink/60' },
  { id: 'family',   label: 'Family',   dot: 'bg-label-orange',  selectedBg: 'bg-label-orange/15',  selectedBorder: 'border-label-orange/60' },
  { id: 'personal', label: 'Personal', dot: 'bg-label-purple',  selectedBg: 'bg-label-purple/15',  selectedBorder: 'border-label-purple/60' },
  { id: 'custom',   label: 'Custom',   dot: 'bg-label-green',   selectedBg: 'bg-label-green/20',   selectedBorder: 'border-label-green/60' },
]

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120]

function durationLabel(min: number) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  if (m === 0) return h === 1 ? '1 hour' : `${h} hours`
  return `${h}h ${m}m`
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toDateValue(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function toTimeValue(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function NewEventModal({ initialDate, onClose }: Props) {
  const addEvent = useAgendaStore((s) => s.addEvent)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<EventCategory>('work')
  const [date, setDate] = useState(toDateValue(initialDate))
  const [time, setTime] = useState(toTimeValue(new Date()))
  const [duration, setDuration] = useState(30)
  const [allDay, setAllDay] = useState(false)
  const [notes, setNotes] = useState('')

  function handleConfirm() {
    const [y, m, d] = date.split('-').map(Number)
    const [h, min] = allDay ? [0, 0] : time.split(':').map(Number)
    const start = new Date(y, m - 1, d, h, min, 0)

    addEvent({
      title: title.trim() || 'New event',
      start: start.toISOString(),
      durationMin: allDay ? 1440 : duration,
      category,
      allDay,
      notes: notes.trim() || undefined,
    })

    toast.success('Event added')
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Bottom sheet — spec modal radius 28px */}
      <div className="absolute inset-x-0 bottom-0 z-50 bg-white rounded-t-modal max-h-[92%] flex flex-col">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-surface" />
        </div>

        {/* Sheet header */}
        <div className="flex items-center justify-between px-5 pb-3 shrink-0">
          <h2 className="text-h3 text-text">New Event</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-11 h-11 rounded-full flex items-center justify-center text-text-muted hover:bg-surface transition-colors"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto scrollbar-none px-5 pb-4 space-y-5">

          {/* Title */}
          <div>
            <label className="block text-caption font-medium text-text-muted mb-1.5 uppercase tracking-wider">
              Title
            </label>
            <input
              className="w-full bg-surface rounded-input px-4 py-3 text-body text-text placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-caption font-medium text-text-muted mb-2 uppercase tracking-wider">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const sel = category === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-body font-medium border-2 transition-colors ${
                      sel
                        ? `${cat.selectedBg} ${cat.selectedBorder} text-text`
                        : 'bg-surface border-transparent text-text-muted hover:border-text-muted/20'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${cat.dot}`} />
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date + all-day toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-caption font-medium text-text-muted uppercase tracking-wider">
                Date
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-caption text-text-muted">All day</span>
                <button
                  role="switch"
                  aria-checked={allDay}
                  onClick={() => setAllDay((v) => !v)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${
                    allDay ? 'bg-primary' : 'bg-surface border border-text-muted/30'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      allDay ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </label>
            </div>
            <input
              type="date"
              className="w-full bg-surface rounded-input px-4 py-3 text-body text-text outline-none focus:ring-2 focus:ring-primary/30"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Time + Duration (hidden when all-day) */}
          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-caption font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                  Start time
                </label>
                <input
                  type="time"
                  className="w-full bg-surface rounded-input px-4 py-3 text-body text-text outline-none focus:ring-2 focus:ring-primary/30"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-caption font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                  Duration
                </label>
                <select
                  className="w-full bg-surface rounded-input px-4 py-3 text-body text-text outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {durationLabel(d)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Notes (persisted) */}
          <div>
            <label className="block text-caption font-medium text-text-muted mb-1.5 uppercase tracking-wider">
              Notes
            </label>
            <textarea
              className="w-full bg-surface rounded-input px-4 py-3 text-body text-text placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Add notes…"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Location — visual only */}
          <div>
            <label className="block text-caption font-medium text-text-muted mb-1.5 uppercase tracking-wider">
              Location
            </label>
            <div className="w-full bg-surface rounded-input px-4 py-3 text-body text-text-muted opacity-50 flex items-center gap-2">
              <span className="flex-1">Add location (coming soon)</span>
            </div>
          </div>

          {/* Reminder — visual only */}
          <div>
            <label className="block text-caption font-medium text-text-muted mb-1.5 uppercase tracking-wider">
              Reminder
            </label>
            <div className="w-full bg-surface rounded-input px-4 py-3 text-body text-text-muted opacity-50 flex items-center justify-between">
              <span>None</span>
              <ChevronRight size={16} strokeWidth={1.5} />
            </div>
          </div>

        </div>

        {/* Confirm */}
        <div className="px-5 py-4 pb-safe shrink-0 border-t border-surface">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleConfirm}
            className="w-full bg-primary text-white font-semibold rounded-btn py-3.5 text-body transition-opacity"
          >
            Add Event
          </motion.button>
        </div>
      </div>
    </>
  )
}
