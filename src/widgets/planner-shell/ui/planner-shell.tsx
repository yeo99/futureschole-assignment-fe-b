import type { ReactNode } from 'react'

interface PlannerShellProps {
  title: string
  description: string
  toolbar?: ReactNode
  children: ReactNode
}

export function PlannerShell({
  title,
  description,
  toolbar,
  children,
}: PlannerShellProps) {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-teal-700">
              FE-B Assignment
            </p>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
                {title}
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                {description}
              </p>
            </div>
          </div>
          {toolbar}
        </header>
        {children}
      </section>
    </main>
  )
}
