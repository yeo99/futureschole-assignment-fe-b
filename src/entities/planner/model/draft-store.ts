import { create } from 'zustand'
import type {
  DraftStudyBlock,
  PlannerResponse,
  SavePlannerBlockRequest,
  SavePlannerResponse,
  StudyBlock,
} from './types'

interface PlannerDraftState {
  weekStart: string | null
  blocks: DraftStudyBlock[]
  lastSavedBlocks: DraftStudyBlock[]
  isDirty: boolean
  lastSavedAt: string | null
  lastErrorMessage: string | null
  initializeDraftFromServer: (planner: PlannerResponse) => void
  addDraftBlock: (block: SavePlannerBlockRequest) => void
  updateDraftBlock: (
    clientId: DraftStudyBlock['clientId'],
    block: SavePlannerBlockRequest,
  ) => void
  removeDraftBlock: (clientId: DraftStudyBlock['clientId']) => void
  replaceDraftAfterSave: (planner: SavePlannerResponse) => void
  setSaveError: (message: string) => void
  resetDraft: () => void
}

function createClientId() {
  return crypto.randomUUID()
}

function toDraftBlock(block: StudyBlock): DraftStudyBlock {
  return {
    ...block,
    clientId: block.id,
  }
}

function createDraftBlock(block: SavePlannerBlockRequest): DraftStudyBlock {
  return {
    ...block,
    clientId: block.id ?? createClientId(),
  }
}

function normalizeDraftBlock(block: DraftStudyBlock) {
  return {
    id: block.id ?? null,
    clientId: block.clientId,
    courseId: block.courseId,
    dayOfWeek: block.dayOfWeek,
    startTime: block.startTime,
    endTime: block.endTime,
    memo: block.memo ?? '',
  }
}

function sortDraftBlocks(blocks: DraftStudyBlock[]) {
  return [...blocks].sort((source, target) =>
    source.clientId.localeCompare(target.clientId),
  )
}

function areDraftBlocksEqual(
  sourceBlocks: DraftStudyBlock[],
  targetBlocks: DraftStudyBlock[],
) {
  return (
    JSON.stringify(sortDraftBlocks(sourceBlocks).map(normalizeDraftBlock)) ===
    JSON.stringify(sortDraftBlocks(targetBlocks).map(normalizeDraftBlock))
  )
}

function createDraftSnapshot(blocks: StudyBlock[]) {
  return blocks.map(toDraftBlock)
}

function createStateAfterDraftChange(
  blocks: DraftStudyBlock[],
  lastSavedBlocks: DraftStudyBlock[],
) {
  return {
    blocks,
    isDirty: !areDraftBlocksEqual(blocks, lastSavedBlocks),
    lastErrorMessage: null,
  }
}

export const usePlannerDraftStore = create<PlannerDraftState>((set) => ({
  weekStart: null,
  blocks: [],
  lastSavedBlocks: [],
  isDirty: false,
  lastSavedAt: null,
  lastErrorMessage: null,

  initializeDraftFromServer: (planner) => {
    const blocks = createDraftSnapshot(planner.blocks)

    set({
      weekStart: planner.weekStart,
      blocks,
      lastSavedBlocks: blocks,
      isDirty: false,
      lastSavedAt: null,
      lastErrorMessage: null,
    })
  },

  addDraftBlock: (block) => {
    set((state) =>
      createStateAfterDraftChange(
        [...state.blocks, createDraftBlock(block)],
        state.lastSavedBlocks,
      ),
    )
  },

  updateDraftBlock: (clientId, block) => {
    set((state) =>
      createStateAfterDraftChange(
        state.blocks.map((draftBlock) =>
          draftBlock.clientId === clientId
            ? {
                ...block,
                clientId,
              }
            : draftBlock,
        ),
        state.lastSavedBlocks,
      ),
    )
  },

  removeDraftBlock: (clientId) => {
    set((state) =>
      createStateAfterDraftChange(
        state.blocks.filter((block) => block.clientId !== clientId),
        state.lastSavedBlocks,
      ),
    )
  },

  replaceDraftAfterSave: (planner) => {
    const blocks = createDraftSnapshot(planner.blocks)

    set({
      weekStart: planner.weekStart,
      blocks,
      lastSavedBlocks: blocks,
      isDirty: false,
      lastSavedAt: new Date().toISOString(),
      lastErrorMessage: null,
    })
  },

  setSaveError: (message) => {
    set({
      lastErrorMessage: message,
    })
  },

  resetDraft: () => {
    set({
      weekStart: null,
      blocks: [],
      lastSavedBlocks: [],
      isDirty: false,
      lastSavedAt: null,
      lastErrorMessage: null,
    })
  },
}))
