import { useCallback, useEffect, useState } from 'react'
import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import { AssistantProvider, useAssistant } from './contexts/AssistantContext'
import { AppLoader } from './components/AppLoader'
import { useIdleReset } from './hooks/useIdleReset'
import Splash from './routes/Splash'
import Onboarding from './routes/Onboarding'
import Signup from './routes/Signup'
import Agenda from './routes/Agenda'
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

  // After the splash, the assistant is guaranteed to be ready.
  // Show the app-level loader only if something unexpected delays it further.
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

  // App shell — Spike is accessible for dev without going through the flow directly
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
