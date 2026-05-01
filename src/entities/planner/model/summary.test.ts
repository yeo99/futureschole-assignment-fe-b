import { describe, expect, it } from 'vitest'
import { calculatePlannerSummary } from './summary'
import type { StudyBlock } from './types'

const blocks: StudyBlock[] = [
  {
    id: 'block-1',
    courseId: 'course-1',
    dayOfWeek: 0,
    startTime: '09:00',
    endTime: '10:30',
  },
  {
    id: 'block-2',
    courseId: 'course-2',
    dayOfWeek: 1,
    startTime: '11:00',
    endTime: '12:00',
  },
]

describe('planner summary', () => {
  it('총 시간, 강의별 시간, 요일별 시간을 계산한다', () => {
    const summary = calculatePlannerSummary(blocks)

    expect(summary.totalMinutes).toBe(150)
    expect(summary.minutesByCourseId).toEqual({
      'course-1': 90,
      'course-2': 60,
    })
    expect(summary.minutesByDayOfWeek[0]).toBe(90)
    expect(summary.minutesByDayOfWeek[1]).toBe(60)
    expect(summary.minutesByDayOfWeek[2]).toBe(0)
  })
})
