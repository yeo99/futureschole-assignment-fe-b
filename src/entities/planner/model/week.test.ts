import { describe, expect, it } from 'vitest'
import {
  convertJsDayToPlannerDay,
  formatISODate,
  getNextWeekStart,
  getPreviousWeekStart,
  getWeekEndDate,
  getWeekStartDate,
  parseISODate,
} from './week'

describe('planner week utils', () => {
  it('JS 일요일 인덱스를 플래너 일요일 인덱스로 변환한다', () => {
    expect(convertJsDayToPlannerDay(0)).toBe(6)
  })

  it('과제 정책에 따라 월요일을 주 시작일로 계산한다', () => {
    expect(formatISODate(getWeekStartDate(new Date(2026, 4, 1)))).toBe(
      '2026-04-27',
    )
  })

  it('ISO 날짜 문자열을 로컬 date-only 값으로 변환한다', () => {
    expect(formatISODate(parseISODate('2026-04-27'))).toBe('2026-04-27')
  })

  it('이전 주와 다음 주 시작일을 계산한다', () => {
    const weekStart = parseISODate('2026-04-27')

    expect(formatISODate(getPreviousWeekStart(weekStart))).toBe('2026-04-20')
    expect(formatISODate(getNextWeekStart(weekStart))).toBe('2026-05-04')
  })

  it('주 종료일은 시작일에서 6일 뒤로 계산한다', () => {
    expect(formatISODate(getWeekEndDate(parseISODate('2026-04-27')))).toBe(
      '2026-05-03',
    )
  })
})
