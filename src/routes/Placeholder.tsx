import { BottomNav, type TabId } from '../components/BottomNav'

interface PlaceholderProps {
  title: string
  tab: TabId
}

function Placeholder({ title, tab }: PlaceholderProps) {
  return (
    <div className="fixed inset-0 bg-surface flex justify-center">
      <div className="w-full max-w-sm flex flex-col h-full">
        <header className="bg-white px-4 pt-safe pb-4 border-b border-surface shrink-0">
          <h1 className="text-xl font-semibold text-text mt-2">{title}</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="text-text font-medium">Coming soon</p>
          <p className="text-sm text-text-muted">This section is under construction and will be ready in a future update.</p>
        </div>
        <BottomNav active={tab} />
      </div>
    </div>
  )
}

export function CalendarScreen() { return <Placeholder title="Calendar" tab="calendar" /> }
export function InsightsScreen()  { return <Placeholder title="Insights"  tab="insights" /> }
export function NotesScreen()     { return <Placeholder title="Notes"     tab="notes" /> }
