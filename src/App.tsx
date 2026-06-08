import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import { MotionConfig } from 'framer-motion'
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

const Insights = lazy(() => import('./routes/Insights'))
const Spike    = lazy(() => import('./routes/Spike'))

type Phase = 'splash' | 'onboarding' | 'signup' | 'app'

function Shell() {
  const { assistant, loadingMessage } = useAssistant()
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('splash')
  const [splashTimerDone, setSplashTimerDone] = useState(false)

  const resetToSeed = useAgendaStore((s) => s.resetToSeed)

  const handleIdleReset = useCallback(() => {
    navigate('/', { replace: true })
    setPhase('splash')
    setSplashTimerDone(false)
  }, [navigate])
  useIdleReset(handleIdleReset)

  const handleLogOut = useCallback(() => {
    resetToSeed()
    toast.success('Signed out')
    navigate('/', { replace: true })
    setPhase('splash')
    setSplashTimerDone(false)
  }, [resetToSeed, navigate])

  useEffect(() => {
    if (splashTimerDone && assistant && phase === 'splash') {
      setPhase('onboarding')
    }
  }, [splashTimerDone, assistant, phase])

  if (phase === 'splash') {
    return <Splash onDone={() => setSplashTimerDone(true)} loading={!assistant} />
  }

  if (!assistant) {
    return <AppLoader message={loadingMessage || undefined} />
  }

  if (phase === 'onboarding') {
    return <Onboarding onSkip={() => setPhase('signup')} onDone={() => setPhase('signup')} />
  }

  if (phase === 'signup') {
    return (
      <Signup
        onDone={() => {
          navigate('/', { replace: true })
          setPhase('app')
        }}
      />
    )
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
        {/* reducedMotion="user" — respects prefers-reduced-motion system setting */}
        <MotionConfig reducedMotion="user">
          <Shell />
          <Toaster
            position="bottom-center"
            offset={20}
            toastOptions={{
              duration: 2500,
              style: {
                background: 'rgba(35,32,44,0.96)',
                color: '#fff',
                border: 'none',
                borderRadius: '14px',
                fontSize: '14px',
                padding: '12px 16px',
                boxShadow: '0 4px 20px rgba(35,32,44,0.25)',
              },
            }}
          />
        </MotionConfig>
      </AssistantProvider>
    </HashRouter>
  )
}
