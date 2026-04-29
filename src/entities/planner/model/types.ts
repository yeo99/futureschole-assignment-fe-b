export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type TimeString = `${number}${number}:${number}${number}`

export interface StudyBlock {
  id: string
  courseId: string
  dayOfWeek: DayOfWeek
  startTime: TimeString
  endTime: TimeString
  memo?: string
}

export interface PlannerResponse {
  weekStart: string
  blocks: StudyBlock[]
}

export interface SavePlannerBlockRequest {
  id?: string
  courseId: string
  dayOfWeek: DayOfWeek
  startTime: TimeString
  endTime: TimeString
  memo?: string
}

export interface SavePlannerRequest {
  weekStart: string
  blocks: SavePlannerBlockRequest[]
}

export interface SavePlannerResponse {
  weekStart: string
  blocks: StudyBlock[]
}

export interface DraftStudyBlock extends SavePlannerBlockRequest {
  clientId: string
}
