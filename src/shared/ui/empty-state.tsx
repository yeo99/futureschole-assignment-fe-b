import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-4 rounded-md border border-dashed border-slate-300 bg-white p-6 text-center">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {description ? (
          <p className="text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
