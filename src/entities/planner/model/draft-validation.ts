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
