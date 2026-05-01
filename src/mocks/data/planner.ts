import type { PlannerResponse } from '@/entities/planner/model/types'

export const mockPlannerByWeekStart = new Map<string, PlannerResponse>([
  [
    '2026-04-27',
    {
      weekStart: '2026-04-27',
      blocks: [
        {
          id: 'block-1',
          courseId: 'course-react',
          dayOfWeek: 0,
          startTime: '09:00',
          endTime: '10:30',
          memo: '컴포넌트 책임 분리 복습',
        },
        {
          id: 'block-2',
          courseId: 'course-typescript',
          dayOfWeek: 2,
          startTime: '14:00',
          endTime: '16:00',
          memo: '도메인 타입과 DTO 분리',
        },
        {
          id: 'block-3',
          courseId: 'course-query',
          dayOfWeek: 4,
          startTime: '10:00',
          endTime: '11:00',
        },
      ],
    },
  ],
])
