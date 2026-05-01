import {
  PLANNER_END_TIME,
  PLANNER_START_TIME,
  SLOT_MINUTES,
} from './constants'
import {
  isAlignedToSlot,
  isWithinPlannerRange,
  parseTimeToMinutes,
} from './time'
import type { StudyBlock, TimeString } from './types'

export type TimeRangeValidationError =
  | 'INVALID_TIME_RANGE'
  | 'OUT_OF_PLANNER_RANGE'
  | 'INVALID_SLOT_UNIT'

export interface TimeConflict {
  sourceBlockId: string
  targetBlockId: string
}

export function validateTimeRange(
  startTime: TimeString,
  endTime: TimeString,
): TimeRangeValidationError | null {
  if (
    !isWithinPlannerRange(startTime, PLANNER_START_TIME, PLANNER_END_TIME) ||
    !isWithinPlannerRange(endTime, PLANNER_START_TIME, PLANNER_END_TIME)
  ) {
    return 'OUT_OF_PLANNER_RANGE'
  }

  if (
    !isAlignedToSlot(startTime, SLOT_MINUTES) ||
    !isAlignedToSlot(endTime, SLOT_MINUTES)
  ) {
    return 'INVALID_SLOT_UNIT'
  }

  if (parseTimeToMinutes(endTime) <= parseTimeToMinutes(startTime)) {
    return 'INVALID_TIME_RANGE'
  }

  return null
}

export function doTimeRangesOverlap(
  sourceStartTime: TimeString,
  sourceEndTime: TimeString,
  targetStartTime: TimeString,
  targetEndTime: TimeString,
): boolean {
  const sourceStartMinutes = parseTimeToMinutes(sourceStartTime)
  const sourceEndMinutes = parseTimeToMinutes(sourceEndTime)
  const targetStartMinutes = parseTimeToMinutes(targetStartTime)
  const targetEndMinutes = parseTimeToMinutes(targetEndTime)

  return (
    sourceStartMinutes < targetEndMinutes &&
    targetStartMinutes < sourceEndMinutes
  )
}

export function findTimeConflicts(blocks: StudyBlock[]): TimeConflict[] {
  const conflicts: TimeConflict[] = []
  const sortedBlocks = [...blocks].sort((source, target) => {
    if (source.dayOfWeek !== target.dayOfWeek) {
      return source.dayOfWeek - target.dayOfWeek
    }

    return parseTimeToMinutes(source.startTime) - parseTimeToMinutes(target.startTime)
  })

  for (let sourceIndex = 0; sourceIndex < sortedBlocks.length; sourceIndex += 1) {
    const sourceBlock = sortedBlocks[sourceIndex]

    for (
      let targetIndex = sourceIndex + 1;
      targetIndex < sortedBlocks.length;
      targetIndex += 1
    ) {
      const targetBlock = sortedBlocks[targetIndex]

      if (sourceBlock.dayOfWeek !== targetBlock.dayOfWeek) {
        break
      }

      if (
        parseTimeToMinutes(targetBlock.startTime) >=
        parseTimeToMinutes(sourceBlock.endTime)
      ) {
        break
      }

      if (
        doTimeRangesOverlap(
          sourceBlock.startTime,
          sourceBlock.endTime,
          targetBlock.startTime,
          targetBlock.endTime,
        )
      ) {
        conflicts.push({
          sourceBlockId: sourceBlock.id,
          targetBlockId: targetBlock.id,
        })
      }
    }
  }

  return conflicts
}

export function hasTimeConflicts(blocks: StudyBlock[]): boolean {
  return findTimeConflicts(blocks).length > 0
}
