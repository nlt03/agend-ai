import { useNavigate, useLocation } from 'react-router-dom'
import { CalendarDays, CalendarRange, Sparkles, BarChart3, NotebookPen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type TabId = 'agenda' | 'calendar' | 'insights' | 'notes'

interface TabItem {
  id: TabId
  icon: LucideIcon
  label: string
  path: string
}

const TABS: TabItem[] = [
  { id: 'agenda',   icon: CalendarDays,  label: 'Agenda',   path: '/' },
  { id: 'calendar', icon: CalendarRange, label: 'Calendar', path: '/calendar' },
  { id: 'insights', icon: BarChart3,     label: 'Insights', path: '/insights' },
  { id: 'notes',    icon: NotebookPen,   label: 'Notes',    path: '/notes' },
]

interface BottomNavProps {
  active: TabId
}

export function BottomNav({ active }: BottomNavProps) {
  const navigate = useNavigate()
  const location = useLocation()

  // Highlight whichever tab matches the current path (allows deep-link highlight).
  const currentTab: TabId =
    (TABS.find((t) => t.path !== '/' && location.pathname.startsWith(t.path))?.id ??
     (location.pathname === '/' ? 'agenda' : active))

  return (
    <nav className="bg-white border-t border-surface pb-safe shrink-0">
      <div className="flex items-center justify-around px-2 pt-1">
        {/* Left two tabs */}
        {TABS.slice(0, 2).map((tab) => (
          <TabButton key={tab.id} tab={tab} active={currentTab === tab.id} onNavigate={() => navigate(tab.path)} />
        ))}

        {/* Centre AI action button */}
        <button
          onClick={() => navigate('/chat')}
          aria-label="Open AI Chat"
          className="flex items-center justify-center w-14 h-14 -mt-5 rounded-full bg-primary shadow-lg shadow-primary/40 text-white transition-transform active:scale-95"
        >
          <Sparkles size={22} strokeWidth={1.5} />
        </button>

        {/* Right two tabs */}
        {TABS.slice(2).map((tab) => (
          <TabButton key={tab.id} tab={tab} active={currentTab === tab.id} onNavigate={() => navigate(tab.path)} />
        ))}
      </div>
    </nav>
  )
}

function TabButton({ tab, active, onNavigate }: { tab: TabItem; active: boolean; onNavigate: () => void }) {
  const Icon = tab.icon
  return (
    <button
      onClick={onNavigate}
      aria-label={tab.label}
      className={`flex flex-col items-center gap-0.5 px-3 py-2 min-w-[52px] transition-colors ${
        active ? 'text-primary' : 'text-text-muted'
      }`}
    >
      <Icon size={22} strokeWidth={1.5} />
      <span className={`text-[10px] font-medium ${active ? 'text-primary' : 'text-text-muted'}`}>
        {tab.label}
      </span>
    </button>
  )
}
