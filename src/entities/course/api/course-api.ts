import { API_ENDPOINTS } from '@/shared/api/api-endpoints'
import { httpClient } from '@/shared/api/http-client'
import type { CourseListResponse } from '../model/types'

export function getCourses() {
  return httpClient.get<CourseListResponse>(API_ENDPOINTS.courses)
}
