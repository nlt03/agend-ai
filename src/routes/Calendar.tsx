import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useAgendaStore, CATEGORY_COLORS } from '../store/agendaStore'
import type { AgendaEvent } from '../store/agendaStore'
import { BottomNav } from '../components/BottomNav'
import NewEventModal from '../components/NewEventModal'

// ---------------------------------------------------------------------------
// Grid helpers
// ---------------------------------------------------------------------------

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface CalCell {
  date: Date
  inMonth: boolean
  isToday: boolean
}

function buildGrid(year: number, month: number): CalCell[] {
  const todayStr = new Date().toDateString()
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay() // 0 = Sunday

  const cells: CalCell[] = []

  // Fill leading days from previous month
  for (let i = startOffset; i > 0; i--) {
    const d = new Date(year, month, 1 - i)
    cells.push({ date: d, inMonth: false, isToday: d.toDateString() === todayStr })
  }

  // Days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let n = 1; n <= daysInMonth; n++) {
    const d = new Date(year, month, n)
    cells.push({ date: d, inMonth: true, isToday: d.toDateString() === todayStr })
  }

  // Fill trailing days from next month to complete the last row
  let trail = 1
  while (cells.length % 7 !== 0) {
    const d = new Date(year, month + 1, trail++)
    cells.push({ date: d, inMonth: false, isToday: d.toDateString() === todayStr })
  }

  return cells
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function EventCard({ event }: { event: AgendaEvent }) {
  const c = CATEGORY_COLORS[event.category]
  return (
    <div className={`${c.card} rounded-2xl px-4 py-3 flex items-center gap-3 shadow-card`}>
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-text truncate">{event.title}</span>
          <span className="text-xs text-text-muted shrink-0">{event.durationMin}m</span>
        </div>
        <span className="text-xs text-text-muted">
          {event.allDay ? 'All day' : fmtTime(event.start)}
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function Calendar() {
  const events = useAgendaStore((s) => s.events)

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [showModal, setShowModal] = useState(false)

  const grid = useMemo(() => buildGrid(year, month), [year, month])

  // Map dateStr → events for fast lookup
  const eventMap = useMemo(() => {
    const map = new Map<string, AgendaEvent[]>()
    for (const ev of events) {
      const key = new Date(ev.start).toDateString()
      const arr = map.get(key) ?? []
      arr.push(ev)
      map.set(key, arr)
    }
    return map
  }, [events])

  const selectedEvents = useMemo(() => {
    const evs = eventMap.get(selectedDate.toDateString()) ?? []
    return [...evs].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }, [eventMap, selectedDate])

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  const selectedDayLabel = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="fixed inset-0 bg-surface flex justify-center">
      <div className="w-full max-w-sm flex flex-col h-full relative">

        {/* Header */}
        <header className="bg-card px-4 pt-safe pb-3 shrink-0">
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={prevMonth}
              aria-label="Previous month"
              className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-surface transition-colors"
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
            <h1 className="font-semibold text-text">
              {MONTH_NAMES[month]} {year}
            </h1>
            <button
              onClick={nextMonth}
              aria-label="Next month"
              className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-surface transition-colors"
            >
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Scrollable content + FAB container */}
        <div className="relative flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto scrollbar-none px-4 pb-6">

            {/* Day-of-week header */}
            <div className="grid grid-cols-7 mt-2 mb-1">
              {DAY_NAMES.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-text-muted py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-7">
              {grid.map((cell, i) => {
                const cellEvents = eventMap.get(cell.date.toDateString()) ?? []
                const isSelected = cell.date.toDateString() === selectedDate.toDateString()

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(cell.date)}
                    className="flex flex-col items-center py-1 gap-0.5"
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                        cell.isToday
                          ? 'bg-primary text-white font-semibold'
                          : isSelected && !cell.isToday
                          ? 'bg-primary/15 text-primary font-medium'
                          : cell.inMonth
                          ? 'text-text'
                          : 'text-text-muted/30'
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>
                    {/* Up to 3 category dots */}
                    <div className="flex gap-0.5 h-1.5">
                      {cellEvents.slice(0, 3).map((ev, j) => (
                        <span
                          key={j}
                          className={`w-1 h-1 rounded-full ${CATEGORY_COLORS[ev.category].dot} ${
                            !cell.inMonth ? 'opacity-40' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Divider */}
            <div className="h-px bg-surface mx-0 my-4" />

            {/* Selected day events */}
            <div>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="font-semibold text-text">{selectedDayLabel}</h2>
                <span className="text-xs text-text-muted">
                  {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
                </span>
              </div>
              {selectedEvents.length === 0 ? (
                <div className="bg-card rounded-2xl py-8 text-center">
                  <p className="text-sm text-text-muted">Nothing scheduled</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-3 text-sm text-primary font-medium"
                  >
                    + Add an event
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map((ev) => (
                    <EventCard key={ev.id} event={ev} />
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* FAB — anchored to bottom-right of content area, above BottomNav */}
          <button
            onClick={() => setShowModal(true)}
            aria-label="Add event"
            className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/40 transition-transform active:scale-95"
          >
            <Plus size={24} strokeWidth={2} />
          </button>
        </div>

        <BottomNav active="calendar" />

        {/* New Event modal — absolute over the max-w-sm container */}
        {showModal && (
          <NewEventModal
            initialDate={selectedDate}
            onClose={() => setShowModal(false)}
          />
        )}

      </div>
    </div>
  )
}
