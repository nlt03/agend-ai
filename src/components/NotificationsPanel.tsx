import { useState } from 'react'
import { X } from 'lucide-react'
import { motion } from 'framer-motion'

interface ToggleItem {
  key: string
  label: string
  sub: string
  defaultOn: boolean
}

const TOGGLES: ToggleItem[] = [
  { key: 'reminders', label: 'Event reminders', sub: 'Get notified before events',  defaultOn: true  },
  { key: 'summary',   label: 'Daily summary',   sub: 'Your day at a glance',        defaultOn: true  },
  { key: 'ai-tips',   label: 'AI suggestions',  sub: 'Smart schedule insights',     defaultOn: false },
  { key: 'weekly',    label: 'Weekly review',   sub: 'End-of-week recap',           defaultOn: false },
]

function Toggle({ on }: { on: boolean }) {
  return (
    <div
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
        on ? 'bg-primary' : 'bg-surface border border-text-muted/20'
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
          on ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </div>
  )
}

interface Props {
  onClose: () => void
}

export function NotificationsPanel({ onClose }: Props) {
  const [states, setStates] = useState<Record<string, boolean>>(
    () => Object.fromEntries(TOGGLES.map((t) => [t.key, t.defaultOn])),
  )

  function toggle(key: string) {
    setStates((s) => ({ ...s, [key]: !s[key] }))
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/40 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="absolute inset-x-0 bottom-0 z-50 bg-white rounded-t-modal overflow-hidden"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-surface" />
        </div>

        <div className="flex items-center justify-between px-5 pb-2">
          <h2 className="text-lg font-semibold text-text">Notifications</h2>
          <motion.button
            whileTap={{ scale: 1.1 }}
            onClick={onClose}
            aria-label="Close"
            className="w-11 h-11 rounded-full flex items-center justify-center text-text-muted hover:bg-surface transition-colors"
          >
            <X size={18} strokeWidth={1.5} />
          </motion.button>
        </div>

        <p className="px-5 text-xs text-text-muted mb-3">
          Visual preview — push notifications are coming in a future update.
        </p>

        <div className="px-5 pb-safe pb-6 space-y-1">
          {TOGGLES.map(({ key, label, sub }) => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggle(key)}
              className="w-full flex items-center justify-between gap-4 px-4 py-3.5 rounded-2xl hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <div className="text-left">
                <p className="text-sm font-medium text-text">{label}</p>
                <p className="text-xs text-text-muted mt-0.5">{sub}</p>
              </div>
              <Toggle on={states[key]} />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </>
  )
}
