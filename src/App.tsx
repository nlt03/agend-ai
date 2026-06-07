import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import { AssistantProvider, useAssistant } from './contexts/AssistantContext'
import { AppLoader } from './components/AppLoader'
import Agenda from './routes/Agenda'
import Spike from './routes/Spike'

function Shell() {
  const { assistant, loadingMessage } = useAssistant()

  if (!assistant) {
    return <AppLoader message={loadingMessage || undefined} />
  }

  return (
    <div className="min-h-screen bg-surface text-text">
      <header className="bg-white border-b border-surface px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-logo font-semibold tracking-tight">
          Agend<span className="text-primary">.AI</span>
        </Link>
        <nav className="text-sm text-text-muted">
          <Link to="/" className="hover:text-primary mr-4">Agenda</Link>
          <Link to="/spike" className="hover:text-primary">⚡ Spike</Link>
        </nav>
      </header>
      <main className="max-w-4xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Agenda />} />
          <Route path="/spike" element={<Spike />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AssistantProvider>
        <Shell />
      </AssistantProvider>
    </HashRouter>
  )
}
