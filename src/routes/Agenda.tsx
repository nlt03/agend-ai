import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, UserRound, Mic, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAgendaStore, CATEGORY_COLORS } from '../store/agendaStore'
import type { AgendaEvent, EventCategory } from '../store/agendaStore'
import { SUGGESTIONS } from '../ai'
import { BottomNav } from '../components/BottomNav'
import { ProfileMenu } from '../components/ProfileMenu'
import { NotificationsPanel } from '../components/NotificationsPanel'

// ---------------------------------------------------------------------------
// Display constants
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<EventCategory, string> = {
  work: 'Work', school: 'School', family: 'Family', personal: 'Personal', custom: 'Custom',
}

const DATE_LABEL = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

function timeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function dayLabel(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.round(
    (new Date(d.toDateString()).getTime() - new Date(now.toDateString()).getTime()) / 86_400_000,
  )
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays <= 6) return d.toLocaleDateString('en-US', { weekday: 'long' })
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// ---------------------------------------------------------------------------
// Carousel sub-components
// ---------------------------------------------------------------------------

// Small tinted label chip — used in event rows inside the carousel
function LabelChip({ category }: { category: EventCategory }) {
  const c = CATEGORY_COLORS[category]
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${c.card}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {CATEGORY_LABELS[category]}
    </span>
  )
}

// Compact event row for carousel cards: title + label chip + time
function EventRow({ event }: { event: AgendaEvent }) {
  return (
    <div className="flex items-start gap-2 py-1.5 first:pt-0 last:pb-0">
      <div className="flex-1 min-w-0 space-y-1">
        <span className="text-sm font-medium text-text block truncate">{event.title}</span>
        <div className="flex items-center gap-1.5">
          <LabelChip category={event.category} />
          <span className="text-xs text-text-muted">
            {event.allDay ? 'All day' : fmtTime(event.start)}
          </span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sheet type
// ---------------------------------------------------------------------------

type SheetType = null | 'profile' | 'notifications'

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function Agenda() {
  const navigate = useNavigate()
  const events = useAgendaStore((s) => s.events)
  const [sheet, setSheet] = useState<SheetType>(null)
  const [heroInput, setHeroInput] = useState('')

  const todayStr = useMemo(() => new Date().toDateString(), [])

  const todayEvents = useMemo(
    () =>
      events
        .filter((e) => new Date(e.start).toDateString() === todayStr)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [events, todayStr],
  )

  const upcomingRaw = useMemo(
    () =>
      events
        .filter((e) => {
          const d = new Date(e.start)
          return (
            d.toDateString() !== todayStr &&
            d.getTime() > Date.now() &&
            d.getTime() < Date.now() + 10 * 86_400_000
          )
        })
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, 8),
    [events, todayStr],
  )

  const dayGroups = useMemo(() => {
    const groups: { label: string; events: AgendaEvent[] }[] = []
    for (const ev of upcomingRaw) {
      const label = dayLabel(ev.start)
      const last = groups[groups.length - 1]
      if (last && last.label === label) last.events.push(ev)
      else groups.push({ label, events: [ev] })
    }
    return groups
  }, [upcomingRaw])

  // Next upcoming event for the "Today at a Glance" card
  const nextEvent = useMemo(
    () => todayEvents.find((e) => new Date(e.start).getTime() > Date.now()),
    [todayEvents],
  )

  // Category breakdown for glance card
  const todayCatCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const ev of todayEvents) {
      counts[ev.category] = (counts[ev.category] ?? 0) + 1
    }
    return counts
  }, [todayEvents])

  function openChat(prompt?: string) {
    navigate('/chat', prompt ? { state: { initialPrompt: prompt } } : undefined)
  }

  function sendHeroInput() {
    const t = heroInput.trim()
    if (!t) return
    setHeroInput('')
    openChat(t)
  }

  // Inverted-pyramid chips: 2 on top, 1 centered below
  const chip0 = SUGGESTIONS[0] as string
  const chip1 = SUGGESTIONS[1] as string
  const chip2 = SUGGESTIONS[2] as string

  return (
    <div className="fixed inset-0 bg-surface flex justify-center">
      <div className="w-full max-w-sm flex flex-col h-full relative">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="bg-white px-5 pt-safe pb-4 shrink-0">
          <div className="flex items-start justify-between mt-3">
            <div>
              <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{DATE_LABEL}</p>
              <h1 className="text-h1 font-semibold text-text mt-0.5">Good {timeOfDay()}</h1>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <motion.button
                whileTap={{ scale: 1.15 }}
                aria-label="Notifications"
                onClick={() => setSheet('notifications')}
                className="w-11 h-11 rounded-full bg-surface flex items-center justify-center text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Bell size={18} strokeWidth={1.5} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 1.15 }}
                aria-label="Profile"
                onClick={() => setSheet('profile')}
                className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <UserRound size={18} strokeWidth={1.5} />
              </motion.button>
            </div>
          </div>
        </header>

        {/* ── Scrollable body ──────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-4 space-y-4">

          {/* ── AI Hero card ─────────────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-3xl">
            {/* Gradient base */}
            <div
              className="absolute inset-0"
              aria-hidden="true"
              style={{
                background:
                  'linear-gradient(135deg, rgba(241,242,246,0.5) 0%, rgba(86,120,255,0.18) 38%, rgba(255,114,159,0.13) 68%, rgba(86,203,249,0.22) 100%)',
              }}
            />
            {/* Bottom-left amber/rose radial blur */}
            <div
              className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(circle, rgba(251,146,60,0.35) 0%, rgba(251,113,133,0.2) 50%, transparent 70%)',
                filter: 'blur(26px)',
              }}
            />
            {/* Bottom-right aqua/grape radial blur */}
            <div
              className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(circle, rgba(34,211,238,0.28) 0%, rgba(139,92,246,0.2) 50%, transparent 70%)',
                filter: 'blur(26px)',
              }}
            />

            {/* Content */}
            <div className="relative px-5 pt-5 pb-5 space-y-4">
              {/* HELLO caption + H2 */}
              <div>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-1 select-none">
                  Hello, Guest
                </p>
                <h2 className="text-h2 font-semibold text-text leading-snug">
                  How can I help you today?
                </h2>
              </div>

              {/* Pill input bar — rounded-full ≈ 100px radius on typical height */}
              <div className="flex items-center bg-white/75 backdrop-blur-sm rounded-full px-4 py-2 gap-2 shadow-sm">
                <input
                  className="flex-1 text-body bg-transparent text-text placeholder:text-text-muted outline-none min-w-0"
                  placeholder="Ask anything…"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendHeroInput()}
                />
                {/* Mic — visual-only; opens chat so it's never a dead button */}
                <motion.button
                  whileTap={{ scale: 1.15 }}
                  onClick={() => openChat()}
                  aria-label="Open chat (voice input coming soon)"
                  className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white shrink-0 transition-colors"
                >
                  <Mic size={16} strokeWidth={1.5} />
                </motion.button>
                {/* Send — animates in once there's input */}
                <AnimatePresence>
                  {heroInput.trim() && (
                    <motion.button
                      key="hero-send"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendHeroInput}
                      aria-label="Send"
                      className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white shrink-0 transition-colors"
                    >
                      <Send size={15} strokeWidth={2} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Suggestion chips — 2 top, 1 centered bottom (spec pyramid) */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2">
                  {([chip0, chip1] as string[]).map((s) => (
                    <motion.button
                      key={s}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openChat(s)}
                      className="text-[11px] font-medium bg-primary/15 text-primary rounded-full px-3 py-1.5 hover:bg-primary/25 transition-colors"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openChat(chip2)}
                  className="text-[11px] font-medium bg-primary/15 text-primary rounded-full px-3 py-1.5 hover:bg-primary/25 transition-colors"
                >
                  {chip2}
                </motion.button>
              </div>
            </div>
          </div>

          {/* ── 3-card horizontal snap carousel ─────────────────────────── */}
          {/*
            Breaks out of px-4 to fill the parent width, then restores px-4
            so the first/last card has the same visual margin as other content.
            scroll-pl-4: tells the browser snap points offset by 16px so the
            first card snaps flush with the left padding edge.
          */}
          <div
            className="overflow-x-auto snap-x snap-mandatory scrollbar-none flex gap-3 -mx-4 px-4 scroll-pl-4 pb-1"
          >
            {/* Card 1 — Today's Agenda: full time-ordered list */}
            <div className="w-[80vw] max-w-[310px] shrink-0 snap-start bg-white rounded-3xl shadow-card px-4 py-4 flex flex-col">
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="text-sm font-semibold text-text">Today's Agenda</h3>
                <span className="text-xs text-text-muted">
                  {todayEvents.length} event{todayEvents.length !== 1 ? 's' : ''}
                </span>
              </div>
              {todayEvents.length === 0 ? (
                <p className="text-sm text-text-muted">Nothing scheduled today</p>
              ) : (
                <div className="divide-y divide-surface/60">
                  {todayEvents.map((ev) => <EventRow key={ev.id} event={ev} />)}
                </div>
              )}
            </div>

            {/* Card 2 — Today at a Glance: count + category distribution + next-up */}
            <div className="w-[80vw] max-w-[310px] shrink-0 snap-start bg-white rounded-3xl shadow-card px-4 py-4 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-text">Today at a Glance</h3>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-bold text-text leading-none">{todayEvents.length}</span>
                <span className="text-sm text-text-muted">events</span>
              </div>
              {/* Category breakdown pills */}
              {todayEvents.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(todayCatCounts).map(([cat, count]) => {
                    const c = CATEGORY_COLORS[cat as EventCategory]
                    return (
                      <span
                        key={cat}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${c.card}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                        {CATEGORY_LABELS[cat as EventCategory]} {count}
                      </span>
                    )
                  })}
                </div>
              )}
              {/* Next up / all done */}
              {nextEvent ? (
                <div className="mt-auto pt-2 border-t border-surface">
                  <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Next up</p>
                  <p className="text-sm font-semibold text-text mt-0.5 truncate">{nextEvent.title}</p>
                  <p className="text-xs text-text-muted">{fmtTime(nextEvent.start)}</p>
                </div>
              ) : todayEvents.length > 0 ? (
                <div className="mt-auto pt-2 border-t border-surface">
                  <p className="text-xs text-text-muted">All done for today</p>
                </div>
              ) : null}
            </div>

            {/* Card 3 — Coming Up: next 10 days, grouped by day */}
            <div className="w-[80vw] max-w-[310px] shrink-0 snap-start bg-white rounded-3xl shadow-card px-4 py-4 flex flex-col">
              <h3 className="text-sm font-semibold text-text mb-3">Coming Up</h3>
              {dayGroups.length === 0 ? (
                <p className="text-sm text-text-muted">Nothing in the next 10 days</p>
              ) : (
                <div className="space-y-3">
                  {dayGroups.map((group) => (
                    <div key={group.label}>
                      <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                        {group.label}
                      </p>
                      <div className="divide-y divide-surface/60">
                        {group.events.map((ev) => <EventRow key={ev.id} event={ev} />)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trailing spacer so last card has right breathing room */}
            <div className="w-4 shrink-0" aria-hidden="true" />
          </div>

        </div>

        <BottomNav active="agenda" />

        {/* Sheets — each wrapped in its own AnimatePresence for independent exit animation */}
        <AnimatePresence>
          {sheet === 'profile' && (
            <ProfileMenu key="profile" onClose={() => setSheet(null)} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {sheet === 'notifications' && (
            <NotificationsPanel key="notifications" onClose={() => setSheet(null)} />
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
