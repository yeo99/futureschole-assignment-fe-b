import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  formatISODate,
  getNextWeekStart,
  getPreviousWeekStart,
  getWeekEndDate,
  parseISODate,
} from '@/entities/planner/model/week'
import { Button } from '@/shared/ui/button'

interface WeekNavigatorProps {
  weekStart: string
  disabled?: boolean
  onChangeWeekStart: (weekStart: string) => void
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function WeekNavigator({
  weekStart,
  disabled = false,
  onChangeWeekStart,
}: WeekNavigatorProps) {
  const weekStartDate = parseISODate(weekStart)
  const weekEndDate = getWeekEndDate(weekStartDate)

  const moveToPreviousWeek = () => {
    onChangeWeekStart(formatISODate(getPreviousWeekStart(weekStartDate)))
  }

  const moveToNextWeek = () => {
    onChangeWeekStart(formatISODate(getNextWeekStart(weekStartDate)))
  }

  return (
    <section className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
          <CalendarDays className="size-5" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">조회 주간</p>
          <p className="text-sm text-slate-600">
            {formatDateLabel(weekStartDate)} - {formatDateLabel(weekEndDate)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Button
          disabled={disabled}
          leftIcon={<ChevronLeft className="size-4" aria-hidden />}
          onClick={moveToPreviousWeek}
          type="button"
          variant="secondary"
        >
          이전 주
        </Button>
        <Button
          disabled={disabled}
          leftIcon={<ChevronRight className="size-4" aria-hidden />}
          onClick={moveToNextWeek}
          type="button"
          variant="secondary"
        >
          다음 주
        </Button>
      </div>
    </section>
  )
}
