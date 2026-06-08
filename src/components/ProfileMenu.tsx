import { useState } from 'react'
import {
  X, ArrowLeft, ChevronRight,
  UserRound, SlidersHorizontal, Shield, HelpCircle, LogOut, Moon,
} from 'lucide-react'
import { useAppEvents } from '../contexts/AppEventsContext'

type SubPage = 'edit-profile' | 'settings' | 'privacy' | 'help'

const SUB_LABELS: Record<SubPage, string> = {
  'edit-profile': 'Edit Profile',
  'settings':     'Settings',
  'privacy':      'Privacy',
  'help':         'Help & Feedback',
}

interface Props {
  onClose: () => void
}

export function ProfileMenu({ onClose }: Props) {
  const { logOut } = useAppEvents()
  const [subPage, setSubPage] = useState<SubPage | null>(null)

  function handleLogOut() {
    logOut()
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Sheet */}
      <div className="absolute inset-x-0 bottom-0 z-50 bg-white rounded-t-modal max-h-[85%] flex flex-col overflow-hidden">

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-surface" />
        </div>

        {subPage ? (
          // ---------------------------------------------------------------
          // Sub-page stub (Edit Profile / Settings / Privacy / Help)
          // ---------------------------------------------------------------
          <>
            <div className="flex items-center gap-1 px-3 pb-3 shrink-0">
              <button
                onClick={() => setSubPage(null)}
                aria-label="Back"
                className="w-11 h-11 rounded-full flex items-center justify-center text-text-muted hover:bg-surface transition-colors"
              >
                <ArrowLeft size={20} strokeWidth={1.5} />
              </button>
              <h2 className="text-lg font-semibold text-text">{SUB_LABELS[subPage]}</h2>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <p className="font-medium text-text">Coming soon</p>
              <p className="text-sm text-text-muted">
                This section will be available in the full release.
              </p>
            </div>
          </>
        ) : (
          // ---------------------------------------------------------------
          // Main menu
          // ---------------------------------------------------------------
          <>
            <div className="flex items-center justify-between px-5 pb-3 shrink-0">
              <h2 className="text-lg font-semibold text-text">Account</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-11 h-11 rounded-full flex items-center justify-center text-text-muted hover:bg-surface transition-colors"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
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

            {/* Scrollable menu items */}
            <div className="flex-1 overflow-y-auto scrollbar-none px-5 pb-safe pb-6 space-y-0.5">

              {(
                [
                  { key: 'edit-profile', icon: UserRound,          label: 'Edit Profile'    },
                  { key: 'settings',     icon: SlidersHorizontal,  label: 'Settings'        },
                  { key: 'privacy',      icon: Shield,             label: 'Privacy'         },
                  { key: 'help',         icon: HelpCircle,         label: 'Help & Feedback' },
                ] as { key: SubPage; icon: typeof UserRound; label: string }[]
              ).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setSubPage(key)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <Icon size={20} strokeWidth={1.5} className="text-text-muted shrink-0" />
                  <span className="flex-1 text-sm font-medium text-text text-left">{label}</span>
                  <ChevronRight size={16} strokeWidth={1.5} className="text-text-muted/60" />
                </button>
              ))}

              {/* Appearance — disabled; dark mode is parked in FUTURE.md */}
              <button
                disabled
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl opacity-40 cursor-default"
                title="Dark mode coming in a future update"
              >
                <Moon size={20} strokeWidth={1.5} className="text-text-muted shrink-0" />
                <span className="flex-1 text-sm font-medium text-text text-left">Appearance</span>
                <span className="text-xs text-text-muted">Coming soon</span>
              </button>

              <div className="h-px bg-surface my-2" />

              {/* Log Out — resets store and returns to splash for the next booth visitor */}
              <button
                onClick={handleLogOut}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-error/8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/40"
              >
                <LogOut size={20} strokeWidth={1.5} className="text-error shrink-0" />
                <span className="flex-1 text-sm font-medium text-error text-left">Log Out</span>
              </button>

            </div>
          </>
        )}
      </div>
    </>
  )
}
