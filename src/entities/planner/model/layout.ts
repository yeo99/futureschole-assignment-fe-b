import { PLANNER_END_TIME, PLANNER_START_TIME } from './constants'
import { getDurationMinutes, parseTimeToMinutes } from './time'
import type { StudyBlock, TimeString } from './types'

export interface BlockLayout {
  topPercent: number
  heightPercent: number
}

export function calculateBlockLayout(
  block: Pick<StudyBlock, 'startTime' | 'endTime'>,
  plannerStartTime: TimeString = PLANNER_START_TIME,
  plannerEndTime: TimeString = PLANNER_END_TIME,
): BlockLayout {
  const plannerDurationMinutes = getDurationMinutes(
    plannerStartTime,
    plannerEndTime,
  )
  const blockOffsetMinutes =
    parseTimeToMinutes(block.startTime) - parseTimeToMinutes(plannerStartTime)
  const blockDurationMinutes = getDurationMinutes(block.startTime, block.endTime)

  return {
    topPercent: (blockOffsetMinutes / plannerDurationMinutes) * 100,
    heightPercent: (blockDurationMinutes / plannerDurationMinutes) * 100,
  }
}
