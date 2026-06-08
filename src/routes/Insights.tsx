import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { useAgendaStore } from '../store/agendaStore'
import type { EventCategory } from '../store/agendaStore'
import { BottomNav } from '../components/BottomNav'

// ---------------------------------------------------------------------------
// Color constants — hex values needed for recharts (Tailwind classes don't work)
// ---------------------------------------------------------------------------

const COLOR_PRIMARY = '#5678FF'
const COLOR_PRIMARY_SOFT = '#A2B4FC'

const CATEGORY_HEX: Record<EventCategory, string> = {
  work:     '#726DA8',
  personal: '#FF729F',
  health:   '#A7E8BD',
  study:    '#56CBF9',
  social:   '#E67F0D',
}

const CATEGORY_LABELS: Record<EventCategory, string> = {
  work: 'Work', personal: 'Personal', health: 'Health', study: 'Study', social: 'Social',
}

// ---------------------------------------------------------------------------
// Stable mock — "most active days" historical average (no real history exists)
// ---------------------------------------------------------------------------

const MOST_ACTIVE_DAYS = [
  { day: 'Wednesday', pct: 92 },
  { day: 'Monday',    pct: 87 },
  { day: 'Friday',    pct: 78 },
  { day: 'Thursday',  pct: 71 },
  { day: 'Tuesday',   pct: 65 },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl px-4 py-4 flex flex-col gap-1">
      <span className="text-2xl font-bold text-text">{value}</span>
      <span className="text-xs font-medium text-text">{label}</span>
      {sub && <span className="text-xs text-text-muted">{sub}</span>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function Insights() {
  const events = useAgendaStore((s) => s.events)
  const notes  = useAgendaStore((s) => s.notes)

  const today = new Date()
  const todayStr = today.toDateString()

  const todayCount = useMemo(
    () => events.filter((e) => new Date(e.start).toDateString() === todayStr).length,
    [events, todayStr],
  )

  const weekCount = useMemo(() => {
    const cutoff = today.getTime() + 7 * 86_400_000
    return events.filter(
      (e) => new Date(e.start).getTime() >= today.getTime() &&
             new Date(e.start).getTime() <= cutoff,
    ).length
  }, [events]) // eslint-disable-line react-hooks/exhaustive-deps

  // Events by category for donut
  const donutData = useMemo(() => {
    const counts: Partial<Record<EventCategory, number>> = {}
    for (const ev of events) {
      counts[ev.category] = (counts[ev.category] ?? 0) + 1
    }
    return (Object.entries(counts) as [EventCategory, number][])
      .map(([cat, value]) => ({ cat, value, color: CATEGORY_HEX[cat] }))
      .sort((a, b) => b.value - a.value)
  }, [events])

  // Events per day — today + next 6 days
  const weekBarData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const dayStr = d.toDateString()
      const count = events.filter((e) => new Date(e.start).toDateString() === dayStr).length
      const label = i === 0
        ? 'Today'
        : d.toLocaleDateString('en-US', { weekday: 'short' })
      return { label, count, isToday: i === 0 }
    })
  }, [events]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 bg-surface flex justify-center">
      <div className="w-full max-w-sm flex flex-col h-full">

        <header className="bg-white px-5 pt-safe pb-4 shrink-0">
          <h1 className="text-2xl font-semibold text-text mt-3">Your Activity</h1>
          <p className="text-sm text-text-muted mt-0.5">Keep up the great work!</p>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-5 space-y-5">

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Events today"    value={todayCount} sub={todayCount > 0 ? "You're on it!" : 'Clear day'} />
            <StatCard label="This week"       value={weekCount}  sub="upcoming" />
            <StatCard label="Total events"    value={events.length} />
            <StatCard label="Notes written"   value={notes.length} />
          </div>

          {/* Category donut */}
          <div className="bg-white rounded-2xl px-4 py-4">
            <h2 className="font-semibold text-text mb-3">Events by Category</h2>
            {donutData.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">No events yet</p>
            ) : (
              <>
                <div className="relative">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {donutData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, _name, props) =>
                          [value, CATEGORY_LABELS[(props as { payload?: { cat?: EventCategory } }).payload?.cat as EventCategory] ?? '']
                        }
                        contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-text">{events.length}</p>
                      <p className="text-xs text-text-muted">events</p>
                    </div>
                  </div>
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                  {donutData.map((entry) => (
                    <div key={entry.cat} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-xs text-text-muted">
                        {CATEGORY_LABELS[entry.cat]} <span className="font-medium text-text">{entry.value}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Events this week bar chart */}
          <div className="bg-white rounded-2xl px-4 py-4">
            <h2 className="font-semibold text-text mb-3">Events This Week</h2>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={weekBarData} barSize={24} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#F1F2F6" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#5A5766' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: '#5A5766' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => [v, 'events']}
                  contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }}
                  cursor={{ fill: '#F1F2F6' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {weekBarData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.isToday ? COLOR_PRIMARY : COLOR_PRIMARY_SOFT}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Most active days — stable mock */}
          <div className="bg-white rounded-2xl px-4 py-4 pb-5">
            <h2 className="font-semibold text-text mb-1">Most Active Days</h2>
            <p className="text-xs text-text-muted mb-4">Based on your typical week</p>
            <div className="space-y-3">
              {MOST_ACTIVE_DAYS.map(({ day, pct }, i) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="text-xs text-text-muted w-20 shrink-0">{day}</span>
                  <div className="flex-1 bg-surface rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: i === 0 ? COLOR_PRIMARY : COLOR_PRIMARY_SOFT,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-text w-8 text-right shrink-0">{pct}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <BottomNav active="insights" />
      </div>
    </div>
  )
}
