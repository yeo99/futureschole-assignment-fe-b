import { http, delay, HttpResponse } from 'msw'
import { API_ERROR_CODES } from '@/shared/api/error-codes'
import { API_ENDPOINTS } from '@/shared/api/api-endpoints'
import { COMMON_MESSAGES } from '@/shared/constants/messages'
import { mockCourses } from './data/courses'
import { mockPlannerByWeekStart } from './data/planner'
import { MOCK_POLICY, MOCK_SCENARIOS } from './mock-policy'
import {
  findTimeConflicts,
  validateTimeRange,
} from '@/entities/planner/model/validation'
import type {
  PlannerResponse,
  SavePlannerRequest,
  StudyBlock,
} from '@/entities/planner/model/types'

function createServerErrorResponse() {
  return HttpResponse.json(
    {
      code: API_ERROR_CODES.SERVER_ERROR,
      message: COMMON_MESSAGES.SERVER_ERROR,
    },
    { status: 500 },
  )
}

function createInvalidBlockResponse(message: string) {
  return HttpResponse.json(
    {
      code: API_ERROR_CODES.INVALID_BLOCK,
      message,
    },
    { status: 400 },
  )
}

function createTimeConflictResponse() {
  return HttpResponse.json(
    {
      code: API_ERROR_CODES.TIME_CONFLICT,
      message: '겹치는 학습 시간이 있습니다.',
    },
    { status: 409 },
  )
}

function createStudyBlocks(request: SavePlannerRequest): StudyBlock[] {
  return request.blocks.map((block, index) => ({
    ...block,
    id: block.id ?? `block-${Date.now()}-${index}`,
  }))
}

function getScenario(request: Request) {
  return new URL(request.url).searchParams.get('scenario')
}

export const handlers = [
  http.get(API_ENDPOINTS.courses, async () => {
    await delay(MOCK_POLICY.RESPONSE_DELAY_MS)

    return HttpResponse.json({
      courses: mockCourses,
    })
  }),

  http.get(API_ENDPOINTS.planner, async ({ request }) => {
    await delay(MOCK_POLICY.RESPONSE_DELAY_MS)

    if (getScenario(request) === MOCK_SCENARIOS.SERVER_ERROR) {
      return createServerErrorResponse()
    }

    const weekStart = new URL(request.url).searchParams.get('weekStart')

    if (!weekStart) {
      return createInvalidBlockResponse('weekStart가 필요합니다.')
    }

    const planner = mockPlannerByWeekStart.get(weekStart)

    return HttpResponse.json<PlannerResponse>(
      planner ?? {
        weekStart,
        blocks: [],
      },
    )
  }),

  http.put(API_ENDPOINTS.planner, async ({ request }) => {
    await delay(MOCK_POLICY.RESPONSE_DELAY_MS)

    if (getScenario(request) === MOCK_SCENARIOS.SERVER_ERROR) {
      return createServerErrorResponse()
    }

    const saveRequest = (await request.json()) as SavePlannerRequest

    if (!saveRequest.weekStart || !Array.isArray(saveRequest.blocks)) {
      return createInvalidBlockResponse('플래너 요청 형식이 올바르지 않습니다.')
    }

    const invalidTimeBlock = saveRequest.blocks.find(
      (block) => validateTimeRange(block.startTime, block.endTime) !== null,
    )

    if (invalidTimeBlock) {
      return HttpResponse.json(
        {
          code: API_ERROR_CODES.INVALID_TIME_RANGE,
          message: '학습 블록의 시간 범위가 올바르지 않습니다.',
        },
        { status: 400 },
      )
    }

    const blocks = createStudyBlocks(saveRequest)
    const conflicts = findTimeConflicts(blocks)

    if (conflicts.length > 0) {
      return createTimeConflictResponse()
    }

    const response: PlannerResponse = {
      weekStart: saveRequest.weekStart,
      blocks,
    }

    mockPlannerByWeekStart.set(saveRequest.weekStart, response)

    return HttpResponse.json(response)
  }),
]
