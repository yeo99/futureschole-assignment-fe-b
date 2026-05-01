import { describe, expect, it } from 'vitest'
import {
  findDraftConflictClientIds,
  hasDraftTimeConflict,
} from './draft-validation'
import type { DraftStudyBlock } from './types'

const baseDraftBlock: DraftStudyBlock = {
  clientId: 'client-block-1',
  id: 'block-1',
  courseId: 'course-1',
  dayOfWeek: 0,
  startTime: '09:00',
  endTime: '10:00',
}

describe('draft planner validation', () => {
  it('같은 요일에 겹치는 후보 블록을 충돌로 본다', () => {
    expect(
      hasDraftTimeConflict(
        {
          dayOfWeek: 0,
          startTime: '09:30',
          endTime: '10:30',
        },
        [baseDraftBlock],
      ),
    ).toBe(true)
  })

  it('수정 중인 자기 자신은 충돌 비교에서 제외한다', () => {
    expect(
      hasDraftTimeConflict(
        {
          clientId: 'client-block-1',
          dayOfWeek: 0,
          startTime: '09:30',
          endTime: '10:30',
        },
        [baseDraftBlock],
      ),
    ).toBe(false)
  })

  it('충돌한 draft 블록의 clientId 목록을 반환한다', () => {
    const conflictClientIds = findDraftConflictClientIds([
      baseDraftBlock,
      {
        ...baseDraftBlock,
        clientId: 'client-block-2',
        id: 'block-2',
        startTime: '09:30',
        endTime: '10:30',
      },
      {
        ...baseDraftBlock,
        clientId: 'client-block-3',
        id: 'block-3',
        startTime: '10:30',
        endTime: '11:00',
      },
    ])

    expect([...conflictClientIds].sort()).toEqual([
      'client-block-1',
      'client-block-2',
    ])
  })
})
