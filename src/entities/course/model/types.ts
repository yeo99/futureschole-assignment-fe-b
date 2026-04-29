export interface Course {
  id: string
  title: string
  color: string
}

export interface CourseListResponse {
  courses: Course[]
}
