import { describe, expect, it } from 'vitest'
import {
  formatMinutesToTime,
  generateTimeOptions,
  isAlignedToSlot,
  isValidTimeFormat,
  isWithinPlannerRange,
  parseTimeToMinutes,
} from './time'

describe('planner time utils', () => {
  it('HH:mm 형식의 시간을 분 단위로 변환한다', () => {
    expect(parseTimeToMinutes('09:30')).toBe(570)
  })

  it('분 단위 값을 HH:mm 형식으로 변환한다', () => {
    expect(formatMinutesToTime(570)).toBe('09:30')
  })

  it('30분 단위가 아닌 시간은 슬롯 기준에 맞지 않는다', () => {
    expect(isValidTimeFormat('09:15')).toBe(true)
    expect(isAlignedToSlot('09:15')).toBe(false)
  })

  it('플래너 운영 시간 경계를 포함한다', () => {
    expect(isWithinPlannerRange('08:00')).toBe(true)
    expect(isWithinPlannerRange('20:00')).toBe(true)
  })

  it('운영 시간 범위 안에서 30분 단위 옵션을 생성한다', () => {
    expect(generateTimeOptions('08:00', '09:00')).toEqual([
      '08:00',
      '08:30',
      '09:00',
    ])
  })
})
