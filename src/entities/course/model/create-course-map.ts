import type { Course } from './types'

export type CourseMap = ReadonlyMap<Course['id'], Course>

export function createCourseMap(courses: Course[]): CourseMap {
  return new Map(courses.map((course) => [course.id, course]))
}
