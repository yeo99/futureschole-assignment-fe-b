import { useMutation, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/api/query-keys'
import { getPlanner, savePlanner } from '../api/planner-api'
import type { SavePlannerRequest } from './types'

export function usePlannerQuery(weekStart: string) {
  return useQuery({
    queryKey: QUERY_KEYS.planner.byWeek(weekStart),
    queryFn: () => getPlanner(weekStart),
  })
}

export function useSavePlannerMutation() {
  return useMutation({
    mutationFn: (request: SavePlannerRequest) => savePlanner(request),
  })
}
