import { useState } from 'react'
import {
  X, ArrowLeft, ChevronRight, Check,
  UserRound, SlidersHorizontal, Shield, HelpCircle, LogOut, Moon, Sun,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppEvents } from '../contexts/AppEventsContext'
import { useTheme } from '../contexts/ThemeContext'
import type { Theme } from '../contexts/ThemeContext'

type SubPage = 'edit-profile' | 'settings' | 'privacy' | 'help' | 'appearance'

const SUB_LABELS: Record<SubPage, string> = {
  'edit-profile': 'Edit Profile',
  'settings':     'Settings',
  'privacy':      'Privacy',
  'help':         'Help & Feedback',
  'appearance':   'Appearance',
}

interface Props {
  onClose: () => void
}

export function ProfileMenu({ onClose }: Props) {
  const { logOut } = useAppEvents()
  const { theme, setTheme } = useTheme()
  const [subPage, setSubPage] = useState<SubPage | null>(null)

  function handleLogOut() {
    logOut()
    onClose()
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
        className="absolute inset-x-0 bottom-0 z-50 bg-card rounded-t-modal max-h-[85%] flex flex-col overflow-hidden"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-surface" />
        </div>

        {subPage ? (
          <>
            <div className="flex items-center gap-1 px-3 pb-3 shrink-0">
              <motion.button
                whileTap={{ scale: 1.1 }}
                onClick={() => setSubPage(null)}
                aria-label="Back"
                className="w-11 h-11 rounded-full flex items-center justify-center text-text-muted hover:bg-surface transition-colors"
              >
                <ArrowLeft size={20} strokeWidth={1.5} />
              </motion.button>
              <h2 className="text-lg font-semibold text-text">{SUB_LABELS[subPage]}</h2>
            </div>

            {subPage === 'appearance' ? (
              <div className="flex-1 overflow-y-auto scrollbar-none px-5 pb-safe pb-6">
                {(
                  [
                    { value: 'light', icon: Sun,  label: 'Light' },
                    { value: 'dark',  icon: Moon, label: 'Dark'  },
                  ] as { value: Theme; icon: typeof Sun; label: string }[]
                ).map(({ value, icon: Icon, label }) => (
                  <motion.button
                    key={value}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setTheme(value)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <Icon size={20} strokeWidth={1.5} className="text-text-muted shrink-0" />
                    <span className="flex-1 text-sm font-medium text-text text-left">{label}</span>
                    {theme === value && (
                      <Check size={16} strokeWidth={2.5} className="text-primary shrink-0" />
                    )}
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                <p className="font-medium text-text">Coming soon</p>
                <p className="text-sm text-text-muted">
                  This section will be available in the full release.
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 pb-3 shrink-0">
              <h2 className="text-lg font-semibold text-text">Account</h2>
              <motion.button
                whileTap={{ scale: 1.1 }}
                onClick={onClose}
                aria-label="Close"
                className="w-11 h-11 rounded-full flex items-center justify-center text-text-muted hover:bg-surface transition-colors"
              >
                <X size={18} strokeWidth={1.5} />
              </motion.button>
            </div>

            {/* Profile card */}
            <div className="mx-5 mb-4 bg-surface rounded-2xl px-4 py-4 flex items-center gap-3 shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                <UserRound size={22} strokeWidth={1.5} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-text">Guest</p>
                <p className="text-xs text-text-muted">guest@agend.ai</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-none px-5 pb-safe pb-6 space-y-0.5">
              {(
                [
                  { key: 'edit-profile', icon: UserRound,         label: 'Edit Profile'    },
                  { key: 'settings',     icon: SlidersHorizontal, label: 'Settings'        },
                  { key: 'privacy',      icon: Shield,            label: 'Privacy'         },
                  { key: 'help',         icon: HelpCircle,        label: 'Help & Feedback' },
                ] as { key: SubPage; icon: typeof UserRound; label: string }[]
              ).map(({ key, icon: Icon, label }) => (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSubPage(key)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <Icon size={20} strokeWidth={1.5} className="text-text-muted shrink-0" />
                  <span className="flex-1 text-sm font-medium text-text text-left">{label}</span>
                  <ChevronRight size={16} strokeWidth={1.5} className="text-text-muted/60" />
                </motion.button>
              ))}

              {/* Appearance — now fully wired with Light / Dark sub-page */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setSubPage('appearance')}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Moon size={20} strokeWidth={1.5} className="text-text-muted shrink-0" />
                <span className="flex-1 text-sm font-medium text-text text-left">Appearance</span>
                <ChevronRight size={16} strokeWidth={1.5} className="text-text-muted/60" />
              </motion.button>

              <div className="h-px bg-surface my-2" />

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleLogOut}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-error/8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/40"
              >
                <LogOut size={20} strokeWidth={1.5} className="text-error shrink-0" />
                <span className="flex-1 text-sm font-medium text-error text-left">Log Out</span>
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </>
  )
}
