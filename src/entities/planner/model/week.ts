import type { DayOfWeek } from './types'

const DAYS_PER_WEEK = 7
const MONDAY_BASED_SUNDAY = 6
const ISO_DATE_PARTS_COUNT = 3

function createDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function convertJsDayToPlannerDay(jsDay: number): DayOfWeek {
  if (jsDay === 0) {
    return MONDAY_BASED_SUNDAY
  }

  return (jsDay - 1) as DayOfWeek
}

export function formatISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function parseISODate(value: string): Date {
  const dateParts = value.split('-').map(Number)

  if (dateParts.length !== ISO_DATE_PARTS_COUNT) {
    return createDateOnly(new Date(NaN))
  }

  const [year, month, day] = dateParts

  return new Date(year, month - 1, day)
}

export function getWeekStartDate(date: Date): Date {
  const dateOnly = createDateOnly(date)
  const plannerDay = convertJsDayToPlannerDay(dateOnly.getDay())

  dateOnly.setDate(dateOnly.getDate() - plannerDay)

  return dateOnly
}

export function addWeeks(date: Date, amount: number): Date {
  const nextDate = createDateOnly(date)

  nextDate.setDate(nextDate.getDate() + amount * DAYS_PER_WEEK)

  return nextDate
}

export function getPreviousWeekStart(weekStart: Date): Date {
  return addWeeks(weekStart, -1)
}

export function getNextWeekStart(weekStart: Date): Date {
  return addWeeks(weekStart, 1)
}

export function getWeekEndDate(weekStart: Date): Date {
  const weekEndDate = createDateOnly(weekStart)

  weekEndDate.setDate(weekEndDate.getDate() + DAYS_PER_WEEK - 1)

  return weekEndDate
}
