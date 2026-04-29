import { parseTimeToMinutes } from './time'
import type { DayOfWeek, StudyBlock } from './types'

export type BlocksByDay = Record<DayOfWeek, StudyBlock[]>

export function sortBlocksByStartTime(blocks: StudyBlock[]): StudyBlock[] {
  return [...blocks].sort(
    (source, target) =>
      parseTimeToMinutes(source.startTime) - parseTimeToMinutes(target.startTime),
  )
}

export function groupBlocksByDay(blocks: StudyBlock[]): Partial<BlocksByDay> {
  const blocksByDay = blocks.reduce<Partial<BlocksByDay>>((grouped, block) => {
    const dayBlocks = grouped[block.dayOfWeek] ?? []
    dayBlocks.push(block)
    grouped[block.dayOfWeek] = dayBlocks

    return grouped
  }, {})

  Object.values(blocksByDay).forEach((dayBlocks) => {
    dayBlocks.sort(
      (source, target) =>
        parseTimeToMinutes(source.startTime) -
        parseTimeToMinutes(target.startTime),
    )
  })

  return blocksByDay
}
