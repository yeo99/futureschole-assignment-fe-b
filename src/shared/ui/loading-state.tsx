import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  title?: string
  description?: string
}

export function LoadingState({
  title = '불러오는 중입니다.',
  description,
}: LoadingStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-md border border-slate-200 bg-white p-6 text-center">
      <Loader2 className="size-5 animate-spin text-slate-500" aria-hidden />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {description ? (
          <p className="text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
    </div>
  )
}
