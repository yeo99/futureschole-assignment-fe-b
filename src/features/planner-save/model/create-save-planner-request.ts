import type {
  DraftStudyBlock,
  SavePlannerBlockRequest,
  SavePlannerRequest,
} from '@/entities/planner/model/types'

function toSavePlannerBlock(
  block: DraftStudyBlock,
): SavePlannerBlockRequest {
  return {
    id: block.id,
    courseId: block.courseId,
    dayOfWeek: block.dayOfWeek,
    startTime: block.startTime,
    endTime: block.endTime,
    memo: block.memo?.trim() || undefined,
  }
}

export function createSavePlannerRequest(
  weekStart: string,
  blocks: DraftStudyBlock[],
): SavePlannerRequest {
  return {
    weekStart,
    blocks: blocks.map(toSavePlannerBlock),
  }
}
