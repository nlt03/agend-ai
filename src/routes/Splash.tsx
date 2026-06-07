import { useEffect } from 'react'
import logoBlue from '../assets/logo-blue.png'

interface SplashProps {
  onDone: () => void
  /** True while the assistant model is still initialising (WebLLM path). */
  loading?: boolean
}

export default function Splash({ onDone, loading = false }: SplashProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      className="fixed inset-0 bg-primary flex flex-col items-center justify-center gap-5 select-none cursor-pointer"
      onClick={onDone}
      role="presentation"
    >
      {/* brightness-0 invert turns any placeholder into a white silhouette on the blue bg.
          Replace with a real white-logo PNG and remove the filter classes. */}
      <img
        src={logoBlue}
        alt=""
        aria-hidden="true"
        className="w-24 h-24 object-contain brightness-0 invert"
        draggable={false}
      />
      <h1 className="font-logo text-4xl font-semibold text-white tracking-tight">
        Agend.AI
      </h1>
      {loading && (
        <span className="absolute bottom-10 text-white/50 text-xs tracking-widest uppercase">
          Preparing…
        </span>
      )}
    </div>
  )
}
