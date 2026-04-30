import { DAYS_OF_WEEK } from './constants'
import { getDurationMinutes } from './time'
import type { DayOfWeek, StudyBlock } from './types'

type SummaryBlock = Pick<
  StudyBlock,
  'courseId' | 'dayOfWeek' | 'startTime' | 'endTime'
>

export interface PlannerSummary {
  totalMinutes: number
  minutesByCourseId: Record<string, number>
  minutesByDayOfWeek: Record<DayOfWeek, number>
}

function createEmptyMinutesByDay(): Record<DayOfWeek, number> {
  const minutesByDay = {} as Record<DayOfWeek, number>

  DAYS_OF_WEEK.forEach((dayOfWeek) => {
    minutesByDay[dayOfWeek] = 0
  })

  return minutesByDay
}

export function calculatePlannerSummary(blocks: SummaryBlock[]): PlannerSummary {
  const summary: PlannerSummary = {
    totalMinutes: 0,
    minutesByCourseId: {},
    minutesByDayOfWeek: createEmptyMinutesByDay(),
  }

  blocks.forEach((block) => {
    const durationMinutes = getDurationMinutes(block.startTime, block.endTime)

    summary.totalMinutes += durationMinutes
    summary.minutesByCourseId[block.courseId] =
      (summary.minutesByCourseId[block.courseId] ?? 0) + durationMinutes
    summary.minutesByDayOfWeek[block.dayOfWeek] += durationMinutes
  })

  return summary
}
