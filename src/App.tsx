import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { AssistantProvider, useAssistant } from './contexts/AssistantContext'
import { AppEventsContext } from './contexts/AppEventsContext'
import { AppLoader } from './components/AppLoader'
import { useIdleReset } from './hooks/useIdleReset'
import { useAgendaStore } from './store/agendaStore'
import Splash from './routes/Splash'
import Onboarding from './routes/Onboarding'
import Signup from './routes/Signup'
import Agenda from './routes/Agenda'
import Chat from './routes/Chat'
import Calendar from './routes/Calendar'
import Notes from './routes/Notes'
import NoteDetail from './routes/NoteDetail'

// ---------------------------------------------------------------------------
// Lazy-loaded routes — keeps the initial (booth) bundle lean.
// Insights pulls recharts (~350 kB); Spike is dev-only and never hits the
// booth path. Both are deferred behind a Suspense/AppLoader boundary.
// ---------------------------------------------------------------------------
const Insights = lazy(() => import('./routes/Insights'))
const Spike    = lazy(() => import('./routes/Spike'))

// ---------------------------------------------------------------------------
// Phase state — in-memory only; fresh first-run on every page load.
// ---------------------------------------------------------------------------
type Phase = 'splash' | 'onboarding' | 'signup' | 'app'

function Shell() {
  const { assistant, loadingMessage } = useAssistant()
  const [phase, setPhase] = useState<Phase>('splash')
  const [splashTimerDone, setSplashTimerDone] = useState(false)

  const resetToSeed = useAgendaStore((s) => s.resetToSeed)

  // Idle reset: when a booth visitor walks away past IDLE_MS, the store is
  // reseeded (inside the hook) and the app returns to the splash screen.
  const handleIdleReset = useCallback(() => {
    setPhase('splash')
    setSplashTimerDone(false)
  }, [])
  useIdleReset(handleIdleReset)

  // Log Out: same effect as idle reset but manual. Used from the profile menu.
  // Also handy as a between-visitor reset at the booth.
  const handleLogOut = useCallback(() => {
    resetToSeed()
    setPhase('splash')
    setSplashTimerDone(false)
  }, [resetToSeed])

  // Advance from splash when BOTH the 1.5s timer fires AND the assistant is ready.
  // For MockAssistant this is immediate; for WebLLM the splash naturally waits longer.
  useEffect(() => {
    if (splashTimerDone && assistant && phase === 'splash') {
      setPhase('onboarding')
    }
  }, [splashTimerDone, assistant, phase])

  if (phase === 'splash') {
    return (
      <Splash
        onDone={() => setSplashTimerDone(true)}
        loading={!assistant}
      />
    )
  }

  if (!assistant) {
    return <AppLoader message={loadingMessage || undefined} />
  }

  if (phase === 'onboarding') {
    return (
      <Onboarding
        onSkip={() => setPhase('signup')}
        onDone={() => setPhase('signup')}
      />
    )
  }

  if (phase === 'signup') {
    return <Signup onDone={() => setPhase('app')} />
  }

  return (
    <AppEventsContext.Provider value={{ logOut: handleLogOut }}>
      <Suspense fallback={<AppLoader />}>
        <Routes>
          <Route path="/"          element={<Agenda />} />
          <Route path="/chat"      element={<Chat />} />
          <Route path="/calendar"  element={<Calendar />} />
          <Route path="/insights"  element={<Insights />} />
          <Route path="/notes"     element={<Notes />} />
          <Route path="/notes/:id" element={<NoteDetail />} />
          <Route path="/spike"     element={<Spike />} />
        </Routes>
      </Suspense>
    </AppEventsContext.Provider>
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
