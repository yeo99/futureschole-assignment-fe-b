import {
  PLANNER_END_TIME,
  PLANNER_START_TIME,
  SLOT_MINUTES,
} from './constants'
import type { TimeString } from './types'

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/
const MINUTES_PER_HOUR = 60

export function isValidTimeFormat(value: string): value is TimeString {
  return TIME_PATTERN.test(value)
}

export function parseTimeToMinutes(time: TimeString): number {
  const [hour, minute] = time.split(':').map(Number)

  return hour * MINUTES_PER_HOUR + minute
}

export function formatMinutesToTime(minutes: number): TimeString {
  const hour = Math.floor(minutes / MINUTES_PER_HOUR)
  const minute = minutes % MINUTES_PER_HOUR

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(
    2,
    '0',
  )}` as TimeString
}

export function isAlignedToSlot(
  time: TimeString,
  slotMinutes = SLOT_MINUTES,
): boolean {
  return parseTimeToMinutes(time) % slotMinutes === 0
}

export function getDurationMinutes(startTime: TimeString, endTime: TimeString) {
  return parseTimeToMinutes(endTime) - parseTimeToMinutes(startTime)
}

export function isWithinPlannerRange(
  time: TimeString,
  startTime: TimeString = PLANNER_START_TIME,
  endTime: TimeString = PLANNER_END_TIME,
): boolean {
  const minutes = parseTimeToMinutes(time)

  return (
    minutes >= parseTimeToMinutes(startTime) &&
    minutes <= parseTimeToMinutes(endTime)
  )
}

export function generateTimeOptions(
  startTime: TimeString = PLANNER_START_TIME,
  endTime: TimeString = PLANNER_END_TIME,
  slotMinutes = SLOT_MINUTES,
): TimeString[] {
  const startMinutes = parseTimeToMinutes(startTime)
  const endMinutes = parseTimeToMinutes(endTime)
  const options: TimeString[] = []

  for (
    let currentMinutes = startMinutes;
    currentMinutes <= endMinutes;
    currentMinutes += slotMinutes
  ) {
    options.push(formatMinutesToTime(currentMinutes))
  }

  return options
}

export function generateSlotStartTimes(
  startTime: TimeString = PLANNER_START_TIME,
  endTime: TimeString = PLANNER_END_TIME,
  slotMinutes = SLOT_MINUTES,
): TimeString[] {
  return generateTimeOptions(startTime, endTime, slotMinutes).slice(0, -1)
}

export function getNextSlotEndTime(
  startTime: TimeString,
  slotMinutes = SLOT_MINUTES,
): TimeString {
  return formatMinutesToTime(parseTimeToMinutes(startTime) + slotMinutes)
}
