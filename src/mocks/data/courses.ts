import type { Course } from '@/entities/course/model/types'

export const mockCourses: Course[] = [
  {
    id: 'course-react',
    title: 'React 실전 패턴',
    color: '#2563eb',
  },
  {
    id: 'course-typescript',
    title: 'TypeScript 타입 설계',
    color: '#7c3aed',
  },
  {
    id: 'course-query',
    title: 'TanStack Query 상태 관리',
    color: '#059669',
  },
  {
    id: 'course-algorithm',
    title: '프론트엔드 개발자를 위한 알고리즘',
    color: '#ea580c',
  },
]
