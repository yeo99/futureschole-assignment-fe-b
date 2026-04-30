import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

type InlineAlertVariant = 'info' | 'success' | 'warning' | 'error'

interface InlineAlertProps {
  variant?: InlineAlertVariant
  children: ReactNode
  className?: string
}

const alertVariantClassNames: Record<InlineAlertVariant, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-950',
  error: 'border-red-200 bg-red-50 text-red-900',
}

const alertIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertTriangle,
} as const

export function InlineAlert({
  variant = 'info',
  children,
  className,
}: InlineAlertProps) {
  const Icon = alertIcons[variant]

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md border px-3 py-2 text-sm',
        alertVariantClassNames[variant],
        className,
      )}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  )
}
