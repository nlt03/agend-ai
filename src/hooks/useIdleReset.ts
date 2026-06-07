import { useEffect, useRef } from 'react'
import { useAgendaStore, IDLE_MS } from '../store/agendaStore'

// Simple debounce — avoids lodash dependency for one function.
function debounce(fn: () => void, ms: number): () => void {
  let timer: ReturnType<typeof setTimeout>
  return () => {
    clearTimeout(timer)
    timer = setTimeout(fn, ms)
  }
}

/**
 * Handles the booth idle-reset lifecycle:
 *   • Registers pointer/key/scroll listeners that keep lastInteraction fresh.
 *   • On mount AND every 30 s, if the idle window has passed:
 *       1. Reseeds the store (resetToSeed).
 *       2. Calls onReset so the caller can return the app to the splash screen.
 *
 * Lower IDLE_MS in agendaStore.ts to test this locally.
 */
export function useIdleReset(onReset: () => void) {
  const touchInteraction = useAgendaStore((s) => s.touchInteraction)

  // Stable ref so the interval closure never goes stale.
  const onResetRef = useRef(onReset)
  useEffect(() => {
    onResetRef.current = onReset
  })

  // Mount check + periodic poll.
  useEffect(() => {
    function check() {
      const { lastInteraction, resetToSeed } = useAgendaStore.getState()
      if (Date.now() - lastInteraction > IDLE_MS) {
        resetToSeed()
        onResetRef.current()
      }
    }

    check() // immediate mount check (catches relaunch after walk-away)
    const id = setInterval(check, 30_000) // periodic poll
    return () => clearInterval(id)
  }, []) // getState() avoids the stale-closure issue; no deps needed

  // Track user interactions — debounced so we don't thrash localStorage.
  useEffect(() => {
    const handler = debounce(touchInteraction, 3_000)
    const passive = { passive: true } as const

    window.addEventListener('pointermove', handler, passive)
    window.addEventListener('pointerdown', handler, passive)
    window.addEventListener('keydown', handler)
    window.addEventListener('scroll', handler, passive)

    return () => {
      window.removeEventListener('pointermove', handler)
      window.removeEventListener('pointerdown', handler)
      window.removeEventListener('keydown', handler)
      window.removeEventListener('scroll', handler)
    }
  }, [touchInteraction])
}
