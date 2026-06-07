import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EventCategory = 'work' | 'personal' | 'health' | 'study' | 'social'

export interface AgendaEvent {
  id: string
  title: string
  start: string       // ISO datetime
  durationMin: number
  category: EventCategory
  allDay?: boolean
  notes?: string
}

// ---------------------------------------------------------------------------
// Category → Tailwind color tokens (2a AA pattern: tint bg + dark text)
// ---------------------------------------------------------------------------

export const CATEGORY_COLORS: Record<
  EventCategory,
  { dot: string; card: string; border: string }
> = {
  work:     { dot: 'bg-label-purple', card: 'bg-label-purple/10', border: 'border-label-purple/40' },
  personal: { dot: 'bg-label-pink',   card: 'bg-label-pink/10',   border: 'border-label-pink/40' },
  health:   { dot: 'bg-label-green',  card: 'bg-label-green/10',  border: 'border-label-green/40' },
  study:    { dot: 'bg-label-cyan',   card: 'bg-label-cyan/10',   border: 'border-label-cyan/40' },
  social:   { dot: 'bg-label-orange', card: 'bg-label-orange/10', border: 'border-label-orange/40' },
}

// ---------------------------------------------------------------------------
// Idle-reset constant — lower this during local testing
// ---------------------------------------------------------------------------

/** Milliseconds of inactivity before the store is reseeded for the next booth visitor. */
export const IDLE_MS = 150_000 // 2.5 minutes

// ---------------------------------------------------------------------------
// Seed helpers
// ---------------------------------------------------------------------------

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

/** Build an ISO datetime string offset from today. */
function isoAt(dayOffset: number, hour: number, minute: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

/** Generate seed events relative to today (never hardcoded dates). */
export function generateSeed(): AgendaEvent[] {
  return [
    // Today
    { id: uid(), title: 'Team standup',            start: isoAt(0, 9,  0),  durationMin: 30,  category: 'work'     },
    { id: uid(), title: 'Lunch with design team',  start: isoAt(0, 12, 30), durationMin: 60,  category: 'social'   },
    { id: uid(), title: 'Focus block — deep work', start: isoAt(0, 16, 30), durationMin: 90,  category: 'work'     },
    // +2 days
    { id: uid(), title: 'Dentist appointment',     start: isoAt(2, 10, 0),  durationMin: 60,  category: 'health'   },
    // +4 days
    { id: uid(), title: 'Project deadline',        start: isoAt(4, 17, 0),  durationMin: 60,  category: 'study'    },
    // +7 days
    { id: uid(), title: 'Study group',             start: isoAt(7, 15, 0),  durationMin: 90,  category: 'study'    },
    // +9 days
    { id: uid(), title: 'Quarterly review',        start: isoAt(9, 11, 0),  durationMin: 60,  category: 'work'     },
  ]
}

// ---------------------------------------------------------------------------
// Selector helpers (used by store methods and by MockAssistant imperatively)
// ---------------------------------------------------------------------------

export function eventsOnDate(events: AgendaEvent[], date: Date): AgendaEvent[] {
  const day = date.toDateString()
  return events
    .filter((e) => new Date(e.start).toDateString() === day)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
}

export function upcomingEvents(events: AgendaEvent[], fromDate: Date): AgendaEvent[] {
  const from = fromDate.getTime()
  return events
    .filter((e) => new Date(e.start).getTime() >= from)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface AgendaStore {
  events: AgendaEvent[]
  lastInteraction: number

  // CRUD
  addEvent: (event: Omit<AgendaEvent, 'id'>) => void
  updateEvent: (id: string, patch: Partial<Omit<AgendaEvent, 'id'>>) => void
  deleteEvent: (id: string) => void

  // Selectors (bound to live state)
  eventsOn: (date: Date) => AgendaEvent[]
  upcoming: (fromDate: Date) => AgendaEvent[]

  // Reset
  resetToSeed: () => void
  touchInteraction: () => void
}

export const useAgendaStore = create<AgendaStore>()(
  persist(
    (set, get) => ({
      events: generateSeed(),
      lastInteraction: Date.now(),

      addEvent: (event) =>
        set((s) => ({ events: [...s.events, { ...event, id: uid() }] })),

      updateEvent: (id, patch) =>
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),

      deleteEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      eventsOn: (date) => eventsOnDate(get().events, date),
      upcoming: (fromDate) => upcomingEvents(get().events, fromDate),

      resetToSeed: () =>
        set({ events: generateSeed(), lastInteraction: Date.now() }),

      touchInteraction: () => set({ lastInteraction: Date.now() }),
    }),
    {
      name: 'agend-ai:v1',
      storage: createJSONStorage(() => localStorage),
      // Only persist data; actions/selectors are recreated from the factory above.
      partialize: (s) => ({ events: s.events, lastInteraction: s.lastInteraction }),
    },
  ),
)
