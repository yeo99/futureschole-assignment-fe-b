import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/api/query-keys'
import { getCourses } from '../api/course-api'

export function useCoursesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.courses,
    queryFn: getCourses,
  })
}
