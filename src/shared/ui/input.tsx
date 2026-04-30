import type { InputHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  isInvalid?: boolean
}

export function Input({ className, isInvalid = false, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-md border bg-white px-3 text-sm text-slate-950 shadow-sm transition-colors',
        'placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500',
        isInvalid ? 'border-red-500' : 'border-slate-300',
        className,
      )}
      aria-invalid={isInvalid || undefined}
      {...props}
    />
  )
}
