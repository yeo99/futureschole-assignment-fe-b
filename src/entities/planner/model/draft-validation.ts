import { doTimeRangesOverlap } from './validation'
import type { DraftStudyBlock, StudyBlock } from './types'

type DraftTimeConflictCandidate = Pick<
  StudyBlock,
  'dayOfWeek' | 'startTime' | 'endTime'
> & {
  clientId?: DraftStudyBlock['clientId']
}

type DraftTimeConflictBlock = Pick<
  DraftStudyBlock,
  'clientId' | 'dayOfWeek' | 'startTime' | 'endTime'
>

export function hasDraftTimeConflict(
  candidate: DraftTimeConflictCandidate,
  blocks: DraftTimeConflictBlock[],
): boolean {
  return blocks.some((block) => {
    if (candidate.clientId && block.clientId === candidate.clientId) {
      return false
    }

    return (
      block.dayOfWeek === candidate.dayOfWeek &&
      doTimeRangesOverlap(
        candidate.startTime,
        candidate.endTime,
        block.startTime,
        block.endTime,
      )
    )
  })
}

export function findDraftConflictClientIds(
  blocks: DraftTimeConflictBlock[],
): Set<DraftStudyBlock['clientId']> {
  const conflictClientIds = new Set<DraftStudyBlock['clientId']>()
  const sortedBlocks = [...blocks].sort((source, target) => {
    if (source.dayOfWeek !== target.dayOfWeek) {
      return source.dayOfWeek - target.dayOfWeek
    }

    return source.startTime.localeCompare(target.startTime)
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

      if (targetBlock.startTime >= sourceBlock.endTime) {
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
        conflictClientIds.add(sourceBlock.clientId)
        conflictClientIds.add(targetBlock.clientId)
      }
    }
  }

  return conflictClientIds
}
