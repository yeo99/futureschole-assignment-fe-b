import { describe, expect, it } from 'vitest'
import {
  doTimeRangesOverlap,
  findTimeConflicts,
  validateTimeRange,
} from './validation'
import type { StudyBlock } from './types'

const baseBlock: StudyBlock = {
  id: 'block-1',
  courseId: 'course-1',
  dayOfWeek: 0,
  startTime: '09:00',
  endTime: '10:00',
}

describe('planner validation', () => {
  it('맞닿은 시간 구간은 충돌로 보지 않는다', () => {
    expect(doTimeRangesOverlap('09:00', '10:00', '10:00', '11:00')).toBe(false)
  })

  it('겹치는 시간 구간은 충돌로 본다', () => {
    expect(doTimeRangesOverlap('09:00', '10:00', '09:30', '10:30')).toBe(true)
  })

  it('종료 시간이 시작 시간보다 늦어야 한다', () => {
    expect(validateTimeRange('10:00', '09:00')).toBe('INVALID_TIME_RANGE')
  })

  it('같은 요일의 겹치는 블록을 충돌로 반환한다', () => {
    const conflicts = findTimeConflicts([
      baseBlock,
      {
        ...baseBlock,
        id: 'block-2',
        startTime: '09:30',
        endTime: '10:30',
      },
    ])

    expect(conflicts).toEqual([
      {
        sourceBlockId: 'block-1',
        targetBlockId: 'block-2',
      },
    ])
  })

  it('다른 요일의 같은 시간 블록은 충돌로 보지 않는다', () => {
    const conflicts = findTimeConflicts([
      baseBlock,
      {
        ...baseBlock,
        id: 'block-2',
        dayOfWeek: 1,
      },
    ])

    expect(conflicts).toEqual([])
  })
})
