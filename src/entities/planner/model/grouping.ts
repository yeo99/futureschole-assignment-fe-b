import { parseTimeToMinutes } from './time'
import type { DayOfWeek, StudyBlock } from './types'

type SortablePlannerBlock = Pick<StudyBlock, 'dayOfWeek' | 'startTime'>

export type BlocksByDay<TBlock extends SortablePlannerBlock = StudyBlock> = Record<
  DayOfWeek,
  TBlock[]
>

export function sortBlocksByStartTime<TBlock extends SortablePlannerBlock>(
  blocks: TBlock[],
): TBlock[] {
  return [...blocks].sort(
    (source, target) =>
      parseTimeToMinutes(source.startTime) - parseTimeToMinutes(target.startTime),
  )
}

export function groupBlocksByDay<TBlock extends SortablePlannerBlock>(
  blocks: TBlock[],
): Partial<BlocksByDay<TBlock>> {
  const blocksByDay = blocks.reduce<Partial<BlocksByDay<TBlock>>>(
    (grouped, block) => {
      const dayBlocks = grouped[block.dayOfWeek] ?? []
      dayBlocks.push(block)
      grouped[block.dayOfWeek] = dayBlocks

      return grouped
    },
    {},
  )

  Object.values(blocksByDay).forEach((dayBlocks) => {
    dayBlocks.sort(
      (source, target) =>
        parseTimeToMinutes(source.startTime) -
        parseTimeToMinutes(target.startTime),
    )
  })

  return blocksByDay
}
