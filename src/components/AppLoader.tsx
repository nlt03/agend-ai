import logoGray from '../assets/logo-gray.png'

interface AppLoaderProps {
  /** Optional message shown below the logo (e.g. "Loading model…") */
  message?: string
}

/**
 * Full-screen branded loader — shown on cold app load and while the
 * WebLLM model is initialising. Keeps the same appearance in both cases.
 */
export function AppLoader({ message }: AppLoaderProps) {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-4 z-50">
      <img
        src={logoGray}
        alt="Agend.AI"
        className="w-32 animate-pulse opacity-60"
        draggable={false}
      />
      {message && (
        <p className="text-sm text-text-muted">{message}</p>
      )}
    </div>
  )
}
