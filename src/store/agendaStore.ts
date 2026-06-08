import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// v2 taxonomy (2h): work/school/family/personal/custom
// Replaces v1's work/personal/health/study/social.
export type EventCategory = 'work' | 'school' | 'family' | 'personal' | 'custom'

export interface AgendaEvent {
  id: string
  title: string
  start: string       // ISO datetime
  durationMin: number
  category: EventCategory
  allDay?: boolean
  notes?: string
}

export interface Note {
  id: string
  title: string
  body: string
  updatedAt: string   // ISO datetime
}

// ---------------------------------------------------------------------------
// Category → Tailwind color tokens
// Spec (2h): work→cyan, school→pink, family→orange, personal→purple, custom→green
// AA pattern: tint fill + dark text. personal/purple: tint only — never dark text
// on the full-saturation fill at small size.
// ---------------------------------------------------------------------------

export const CATEGORY_COLORS: Record<
  EventCategory,
  { dot: string; card: string; border: string }
> = {
  work:     { dot: 'bg-label-cyan',    card: 'bg-label-cyan/10',    border: 'border-label-cyan/40' },
  school:   { dot: 'bg-label-pink',    card: 'bg-label-pink/10',    border: 'border-label-pink/40' },
  family:   { dot: 'bg-label-orange',  card: 'bg-label-orange/10',  border: 'border-label-orange/40' },
  personal: { dot: 'bg-label-purple',  card: 'bg-label-purple/10',  border: 'border-label-purple/40' },
  custom:   { dot: 'bg-label-green',   card: 'bg-label-green/10',   border: 'border-label-green/40' },
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

/** Generate seed events — all five 2h categories appear at least once. */
export function generateSeed(): AgendaEvent[] {
  return [
    // Today
    { id: uid(), title: 'Team standup',            start: isoAt(0, 9,  0),  durationMin: 30,  category: 'work'     },
    { id: uid(), title: 'Family dinner',           start: isoAt(0, 18, 30), durationMin: 90,  category: 'family'   },
    { id: uid(), title: 'Focus block — deep work', start: isoAt(0, 16, 30), durationMin: 90,  category: 'work'     },
    // +1 day
    { id: uid(), title: 'Morning run',             start: isoAt(1, 7,  0),  durationMin: 45,  category: 'personal' },
    // +2 days
    { id: uid(), title: 'Study session — Physics', start: isoAt(2, 10, 0),  durationMin: 60,  category: 'school'   },
    // +4 days
    { id: uid(), title: 'Science fair deadline',   start: isoAt(4, 17, 0),  durationMin: 60,  category: 'school'   },
    // +7 days
    { id: uid(), title: 'Book club',               start: isoAt(7, 15, 0),  durationMin: 90,  category: 'custom'   },
    // +9 days
    { id: uid(), title: 'Quarterly review',        start: isoAt(9, 11, 0),  durationMin: 60,  category: 'work'     },
  ]
}

/** Generate seed notes relative to today (never hardcoded dates). */
export function generateNotesSeed(): Note[] {
  return [
    {
      id: uid(),
      title: 'Meeting Notes — Q2 Planning',
      body: 'Discussed roadmap priorities for Q2. Key decisions:\n- Focus on user retention features\n- Delay the API integration to Q3\n- Schedule weekly check-ins every Thursday\n\nAction items:\n• Design mockups by end of week\n• Backend team to review architecture\n• PM to update the roadmap document',
      updatedAt: isoAt(0, 10, 0),
    },
    {
      id: uid(),
      title: 'Study Guide — Physics Exam',
      body: 'Chapter 5: Forces and Motion\n- Newton\'s 3 laws: inertia, F=ma, action-reaction\n- Key formulas: F=ma, p=mv, KE=½mv²\n- Vector vs scalar quantities\n\nChapter 6: Energy\n- Conservation of energy\n- Work-energy theorem: W = ΔKE\n- Potential vs kinetic energy conversion',
      updatedAt: isoAt(-1, 20, 0),
    },
    {
      id: uid(),
      title: 'Vacation Planning',
      body: 'Possible destinations:\n1. Oaxaca — food, ruins, beach nearby (Puerto Escondido)\n2. Colombia — Medellín + coffee region\n3. Japan — Tokyo/Kyoto route\n\nBudget estimate: ~$1,500–2,000 per person for 10 days\nBest months: late September to November\n\nTodo:\n- Check passport expiration\n- Compare flight prices\n- Look into travel insurance',
      updatedAt: isoAt(-3, 15, 30),
    },
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
  notes: Note[]
  lastInteraction: number

  // Events CRUD
  addEvent: (event: Omit<AgendaEvent, 'id'>) => void
  updateEvent: (id: string, patch: Partial<Omit<AgendaEvent, 'id'>>) => void
  deleteEvent: (id: string) => void

  // Notes CRUD — addNote returns the new note's id for immediate navigation
  addNote: (note: Omit<Note, 'id' | 'updatedAt'>) => string
  updateNote: (id: string, patch: Partial<Omit<Note, 'id'>>) => void
  deleteNote: (id: string) => void

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
      notes: generateNotesSeed(),
      lastInteraction: Date.now(),

      addEvent: (event) =>
        set((s) => ({ events: [...s.events, { ...event, id: uid() }] })),

      updateEvent: (id, patch) =>
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),

      deleteEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      addNote: (note) => {
        const id = uid()
        const updatedAt = new Date().toISOString()
        set((s) => ({ notes: [{ ...note, id, updatedAt }, ...s.notes] }))
        return id
      },

      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n,
          ),
        })),

      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      eventsOn: (date) => eventsOnDate(get().events, date),
      upcoming: (fromDate) => upcomingEvents(get().events, fromDate),

      resetToSeed: () =>
        set({ events: generateSeed(), notes: generateNotesSeed(), lastInteraction: Date.now() }),

      touchInteraction: () => set({ lastInteraction: Date.now() }),
    }),
    {
      // v2: bumped from v1 to force fresh seed after category taxonomy rename.
      // Old persisted v1 data had categories (health/study/social) that no longer exist.
      name: 'agend-ai:v2',
      storage: createJSONStorage(() => localStorage),
      // Only persist data; actions/selectors are recreated from the factory above.
      partialize: (s) => ({
        events: s.events,
        notes: s.notes,
        lastInteraction: s.lastInteraction,
      }),
    },
  ),
)
