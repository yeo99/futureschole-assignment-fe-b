import type { DayOfWeek, TimeString } from './types'

export const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'] as const

export const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6] as const satisfies readonly DayOfWeek[]

export const PLANNER_START_TIME = '08:00' satisfies TimeString

export const PLANNER_END_TIME = '20:00' satisfies TimeString

export const SLOT_MINUTES = 30

export const MAX_MEMO_LENGTH = 200
