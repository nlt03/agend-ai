import { useState } from 'react'
import { CalendarDays, Sparkles, BarChart3, Crown, ArrowLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Icon } from '../components/Icon'

interface Slide {
  icon: LucideIcon
  iconClass: string
  bgClass: string
  title: string
  subtitle: string
}

const SLIDES: Slide[] = [
  {
    icon: CalendarDays,
    iconClass: 'text-label-cyan',
    bgClass: 'bg-label-cyan/20',
    title: 'Everything in one place',
    subtitle: 'Tasks, lists and notes — all in one app',
  },
  {
    icon: Sparkles,
    iconClass: 'text-primary',
    bgClass: 'bg-primary/10',
    title: 'Your AI assistant, always ready',
    subtitle: 'Smart suggestions, not busywork',
  },
  {
    icon: BarChart3,
    iconClass: 'text-label-orange',
    bgClass: 'bg-label-orange/20',
    title: 'See how productive you are',
    subtitle: 'Visual insights into your habits',
  },
  {
    icon: Crown,
    iconClass: 'text-white',
    bgClass: 'bg-label-purple', // full purple — white icon at large size passes AA (4.70:1)
    title: 'Free to start, powerful to upgrade',
    subtitle: 'Core features always free; premium capacity when needed',
  },
]

interface OnboardingProps {
  onSkip: () => void
  onDone: () => void
}

export default function Onboarding({ onSkip, onDone }: OnboardingProps) {
  const [current, setCurrent] = useState(0)
  const isLast = current === SLIDES.length - 1
  const slide = SLIDES[current]

  function next() {
    if (isLast) onDone()
    else setCurrent((c) => c + 1)
  }

  function back() {
    if (current > 0) setCurrent((c) => c - 1)
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col max-w-sm mx-auto">
      {/* Navigation row: back arrow (slide 2+) + skip */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2 shrink-0">
        {current > 0 ? (
          <button
            onClick={back}
            aria-label="Previous slide"
            className="w-11 h-11 rounded-full flex items-center justify-center text-text-muted hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
        ) : (
          /* Spacer so Skip stays on the right */
          <div className="w-11 h-11" aria-hidden="true" />
        )}
        <button
          onClick={onSkip}
          className="text-sm text-text-muted hover:text-text transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Illustration + text — slide-in animation on key change */}
      <div key={current} className="flex-1 flex flex-col items-center justify-center px-8 gap-6 animate-slide-in">
        <div className={`rounded-3xl p-10 flex items-center justify-center ${slide.bgClass}`}>
          <Icon icon={slide.icon} size={72} className={slide.iconClass} />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-h2 font-semibold text-text leading-tight">
            {slide.title}
          </h2>
          <p className="text-body text-text-muted leading-relaxed">
            {slide.subtitle}
          </p>
        </div>
      </div>

      {/* Dots + CTA */}
      <div className="shrink-0 px-6 pb-10 flex flex-col items-center gap-6">
        {/* Progress dots — spec: active ~32px wide / inactive 8px at lavender 40% */}
        <div className="flex gap-2" role="tablist" aria-label="Slide progress">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-8 h-2 bg-primary'
                  : 'w-2 h-2 bg-label-purple/40'
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-full h-14 bg-primary text-white font-semibold text-body rounded-btn hover:bg-primary/90 transition-colors active:scale-[0.98]"
        >
          {isLast ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  )
}
