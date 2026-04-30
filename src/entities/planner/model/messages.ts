import type { TimeRangeValidationError } from './validation'

export const PLANNER_VALIDATION_MESSAGES = {
  REQUIRED_COURSE: '강의를 선택해 주세요.',
  REQUIRED_DAY: '요일을 선택해 주세요.',
  REQUIRED_START_TIME: '시작 시간을 선택해 주세요.',
  REQUIRED_END_TIME: '종료 시간을 선택해 주세요.',
  INVALID_TIME_FORMAT: '시간 형식이 올바르지 않습니다.',
  INVALID_TIME_RANGE: '종료 시간은 시작 시간보다 늦어야 합니다.',
  OUT_OF_PLANNER_RANGE: '플래너 운영 시간 안에서 선택해 주세요.',
  INVALID_SLOT_UNIT: '시간은 30분 단위로 선택해 주세요.',
  TIME_CONFLICT: '같은 요일에 겹치는 학습 블록이 있습니다.',
  MEMO_TOO_LONG: '메모는 200자 이하로 입력해 주세요.',
} as const

export const TIME_RANGE_VALIDATION_MESSAGES: Record<
  TimeRangeValidationError,
  string
> = {
  INVALID_TIME_RANGE: PLANNER_VALIDATION_MESSAGES.INVALID_TIME_RANGE,
  OUT_OF_PLANNER_RANGE: PLANNER_VALIDATION_MESSAGES.OUT_OF_PLANNER_RANGE,
  INVALID_SLOT_UNIT: PLANNER_VALIDATION_MESSAGES.INVALID_SLOT_UNIT,
}

export const PLANNER_CONFIRM_MESSAGES = {
  DELETE_BLOCK: '이 학습 블록을 삭제할까요?',
  DISCARD_UNSAVED_CHANGES: '저장하지 않은 변경사항이 있습니다. 이동할까요?',
} as const
