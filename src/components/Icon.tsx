import type { LucideProps } from 'lucide-react'
import type { ComponentType } from 'react'

interface IconProps extends Omit<LucideProps, 'size' | 'strokeWidth'> {
  icon: ComponentType<LucideProps>
  /** Defaults to 24 per design spec */
  size?: number
}

/**
 * Renders any Lucide icon at 24px with a consistent 1.5 stroke weight.
 * Import individual icons from lucide-react to keep bundle size small.
 */
export function Icon({ icon: LucideIcon, size = 24, ...rest }: IconProps) {
  return <LucideIcon size={size} strokeWidth={1.5} {...rest} />
}
