import { useCallback, useEffect, useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { AssistantProvider, useAssistant } from './contexts/AssistantContext'
import { AppLoader } from './components/AppLoader'
import { useIdleReset } from './hooks/useIdleReset'
import Splash from './routes/Splash'
import Onboarding from './routes/Onboarding'
import Signup from './routes/Signup'
import Agenda from './routes/Agenda'
import Chat from './routes/Chat'
import Calendar from './routes/Calendar'
import Insights from './routes/Insights'
import Notes from './routes/Notes'
import NoteDetail from './routes/NoteDetail'
import Spike from './routes/Spike'

// The entry flow runs in-memory so every launch gets the full first-run experience.
type Phase = 'splash' | 'onboarding' | 'signup' | 'app'

function Shell() {
  const { assistant, loadingMessage } = useAssistant()
  const [phase, setPhase] = useState<Phase>('splash')
  const [splashTimerDone, setSplashTimerDone] = useState(false)

  // Idle reset: when a booth visitor walks away past IDLE_MS, the store
  // is reseeded (inside the hook) and the app returns to the splash screen.
  const handleIdleReset = useCallback(() => {
    setPhase('splash')
    setSplashTimerDone(false)
  }, [])
  useIdleReset(handleIdleReset)

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
    <Routes>
      <Route path="/" element={<Agenda />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/insights" element={<Insights />} />
      <Route path="/notes" element={<Notes />} />
      <Route path="/notes/:id" element={<NoteDetail />} />
      <Route path="/spike" element={<Spike />} />
    </Routes>
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
