import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, UserRound, Sparkles } from 'lucide-react'
import { useAgendaStore, CATEGORY_COLORS } from '../store/agendaStore'
import type { AgendaEvent } from '../store/agendaStore'
import { SUGGESTIONS } from '../ai'
import { BottomNav } from '../components/BottomNav'
import { ProfileMenu } from '../components/ProfileMenu'
import { NotificationsPanel } from '../components/NotificationsPanel'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const DATE_LABEL = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

// ---------------------------------------------------------------------------
// EventCard — tint bg, full-saturation dot, dark text (2a AA pattern)
// ---------------------------------------------------------------------------

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
        <span className="text-xs text-text-muted">{fmtTime(event.start)}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Day group label for Coming Up
// ---------------------------------------------------------------------------

function dayLabel(iso: string): string {
  const d = new Date(iso)
  const now = new Date()

  const diffDays = Math.round(
    (new Date(d.toDateString()).getTime() - new Date(now.toDateString()).getTime()) /
      86_400_000,
  )

  if (diffDays === 1) return 'Tomorrow'
  if (diffDays <= 6) return d.toLocaleDateString('en-US', { weekday: 'long' })
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// ---------------------------------------------------------------------------
// Sheet type — which overlay is open
// ---------------------------------------------------------------------------

type SheetType = null | 'profile' | 'notifications'

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function Agenda() {
  const navigate = useNavigate()
  const events = useAgendaStore((s) => s.events)
  const [sheet, setSheet] = useState<SheetType>(null)

  const todayStr = new Date().toDateString()

  const todayEvents = events
    .filter((e) => new Date(e.start).toDateString() === todayStr)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  // Upcoming = events from tomorrow onward, limited to next 10 days, max 8 items
  const upcomingRaw = events
    .filter((e) => {
      const d = new Date(e.start)
      return (
        d.toDateString() !== todayStr &&
        d.getTime() > Date.now() &&
        d.getTime() < Date.now() + 10 * 86_400_000
      )
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 8)

  // Group upcoming by day
  const dayGroups: { label: string; events: AgendaEvent[] }[] = []
  for (const ev of upcomingRaw) {
    const label = dayLabel(ev.start)
    const last = dayGroups[dayGroups.length - 1]
    if (last && last.label === label) last.events.push(ev)
    else dayGroups.push({ label, events: [ev] })
  }

  function openChat(prompt?: string) {
    navigate('/chat', prompt ? { state: { initialPrompt: prompt } } : undefined)
  }

  return (
    <div className="fixed inset-0 bg-surface flex justify-center">
      {/* relative so the profile/notifications sheets can position absolutely inside */}
      <div className="w-full max-w-sm flex flex-col h-full relative">

        {/* Header */}
        <header className="bg-white px-5 pt-safe pb-4 shrink-0">
          <div className="flex items-start justify-between mt-3">
            <div>
              <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{DATE_LABEL}</p>
              <h1 className="text-h1 font-semibold text-text mt-0.5">{greeting()}</h1>
            </div>
            {/* Icon buttons — w-11 h-11 (44px) for WCAG 2.5.5 tap-target compliance */}
            <div className="flex items-center gap-1 mt-1">
              <button
                aria-label="Notifications"
                onClick={() => setSheet('notifications')}
                className="w-11 h-11 rounded-full bg-surface flex items-center justify-center text-text-muted hover:bg-surface/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Bell size={18} strokeWidth={1.5} />
              </button>
              <button
                aria-label="Profile"
                onClick={() => setSheet('profile')}
                className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <UserRound size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-5 space-y-6">

          {/* AI entry */}
          <div className="space-y-3">
            <button
              onClick={() => openChat()}
              className="w-full bg-white rounded-2xl shadow-sm px-4 py-3.5 flex items-center gap-3 text-left"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles size={18} strokeWidth={1.5} className="text-primary" />
              </div>
              <span className="text-sm text-text-muted">How can I help you today?</span>
            </button>

            {/* Suggestion chips — horizontal scroll */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 pb-0.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => openChat(s)}
                  className="shrink-0 text-xs bg-white rounded-full px-3.5 py-2 text-text-muted border border-surface hover:border-primary/50 hover:text-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Today's Agenda */}
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-semibold text-text">Today's Agenda</h2>
              <span className="text-xs text-text-muted">{todayEvents.length} event{todayEvents.length !== 1 ? 's' : ''}</span>
            </div>
            {todayEvents.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6 bg-white rounded-2xl">
                Nothing scheduled for today
              </p>
            ) : (
              <div className="space-y-2">
                {todayEvents.map((ev) => <EventCard key={ev.id} event={ev} />)}
              </div>
            )}
          </section>

          {/* Coming Up */}
          {dayGroups.length > 0 && (
            <section className="pb-4">
              <h2 className="font-semibold text-text mb-3">Coming Up</h2>
              <div className="space-y-4">
                {dayGroups.map((group) => (
                  <div key={group.label}>
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 px-1">
                      {group.label}
                    </p>
                    <div className="space-y-2">
                      {group.events.map((ev) => <EventCard key={ev.id} event={ev} />)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <BottomNav active="agenda" />

        {/* Sheets — positioned absolute within the relative max-w-sm container */}
        {sheet === 'profile'       && <ProfileMenu         onClose={() => setSheet(null)} />}
        {sheet === 'notifications' && <NotificationsPanel  onClose={() => setSheet(null)} />}

      </div>
    </div>
  )
}
