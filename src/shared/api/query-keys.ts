export const QUERY_KEYS = {
  courses: ['courses'] as const,
  planner: {
    root: ['planner'] as const,
    byWeek: (weekStart: string) => ['planner', weekStart] as const,
  },
} as const
