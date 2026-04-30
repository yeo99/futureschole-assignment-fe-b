import { z } from 'zod'
import { DAYS_OF_WEEK, MAX_MEMO_LENGTH } from '@/entities/planner/model/constants'
import {
  PLANNER_VALIDATION_MESSAGES,
  TIME_RANGE_VALIDATION_MESSAGES,
} from '@/entities/planner/model/messages'
import { isValidTimeFormat } from '@/entities/planner/model/time'
import type { DayOfWeek, TimeString } from '@/entities/planner/model/types'
import { validateTimeRange } from '@/entities/planner/model/validation'

const dayOfWeekSchema = z
  .string()
  .min(1, PLANNER_VALIDATION_MESSAGES.REQUIRED_DAY)
  .transform(Number)
  .pipe(
    z
      .number()
      .refine(
        (dayOfWeek): dayOfWeek is DayOfWeek =>
          DAYS_OF_WEEK.includes(dayOfWeek as DayOfWeek),
        PLANNER_VALIDATION_MESSAGES.REQUIRED_DAY,
      ),
  )

const timeSchema = (requiredMessage: string) =>
  z
    .string()
    .min(1, requiredMessage)
    .refine(isValidTimeFormat, PLANNER_VALIDATION_MESSAGES.INVALID_TIME_FORMAT)

export const studyBlockFormSchema = z
  .object({
    courseId: z.string().min(1, PLANNER_VALIDATION_MESSAGES.REQUIRED_COURSE),
    dayOfWeek: dayOfWeekSchema,
    startTime: timeSchema(PLANNER_VALIDATION_MESSAGES.REQUIRED_START_TIME),
    endTime: timeSchema(PLANNER_VALIDATION_MESSAGES.REQUIRED_END_TIME),
    memo: z
      .string()
      .max(MAX_MEMO_LENGTH, PLANNER_VALIDATION_MESSAGES.MEMO_TOO_LONG)
      .optional(),
  })
  .superRefine((value, context) => {
    if (
      !isValidTimeFormat(value.startTime) ||
      !isValidTimeFormat(value.endTime)
    ) {
      return
    }

    const timeRangeError = validateTimeRange(
      value.startTime as TimeString,
      value.endTime as TimeString,
    )

    if (!timeRangeError) {
      return
    }

    context.addIssue({
      code: 'custom',
      path: ['endTime'],
      message: TIME_RANGE_VALIDATION_MESSAGES[timeRangeError],
    })
  })

export type StudyBlockFormInput = z.input<typeof studyBlockFormSchema>

export type StudyBlockFormValues = z.output<typeof studyBlockFormSchema>
