import { API_ENDPOINTS } from '@/shared/api/api-endpoints'
import { httpClient } from '@/shared/api/http-client'
import type {
  PlannerResponse,
  SavePlannerRequest,
  SavePlannerResponse,
} from '../model/types'

export function getPlanner(weekStart: string) {
  const searchParams = new URLSearchParams({ weekStart })

  return httpClient.get<PlannerResponse>(
    `${API_ENDPOINTS.planner}?${searchParams.toString()}`,
  )
}

export function savePlanner(request: SavePlannerRequest) {
  return httpClient.put<SavePlannerResponse>(API_ENDPOINTS.planner, request)
}
