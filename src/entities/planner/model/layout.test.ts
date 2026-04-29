import { describe, expect, it } from 'vitest'
import { calculateBlockLayout } from './layout'

describe('planner layout', () => {
  it('운영 시간 기준으로 블록의 top과 height 비율을 계산한다', () => {
    const layout = calculateBlockLayout({
      startTime: '09:00',
      endTime: '10:00',
    })

    expect(layout.topPercent).toBeCloseTo(8.3333)
    expect(layout.heightPercent).toBeCloseTo(8.3333)
  })
})
