import type { CourseMap } from '@/entities/course/model/create-course-map'
import { DAY_LABELS, DAYS_OF_WEEK } from '@/entities/planner/model/constants'
import { calculatePlannerSummary } from '@/entities/planner/model/summary'
import type { DraftStudyBlock } from '@/entities/planner/model/types'
import { EmptyState } from '@/shared/ui/empty-state'

interface PlannerSummaryProps {
  blocks: DraftStudyBlock[]
  courseMap: CourseMap
}

function formatHourText(minutes: number) {
  const hours = minutes / 60

  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}시간`
}

export function PlannerSummary({ blocks, courseMap }: PlannerSummaryProps) {
  const summary = calculatePlannerSummary(blocks)
  const courseEntries = Object.entries(summary.minutesByCourseId)

  if (blocks.length === 0) {
    return (
      <EmptyState
        title="아직 학습 요약이 없습니다."
        description="학습 블록을 추가하면 총 시간, 강의별 시간, 요일별 시간이 표시됩니다."
      />
    )
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(180px,0.7fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500">총 학습 시간</p>
        <p className="mt-2 text-3xl font-semibold text-slate-950">
          {formatHourText(summary.totalMinutes)}
        </p>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-950">강의별 배분</h2>
        <ul className="mt-3 grid gap-2">
          {courseEntries.map(([courseId, minutes]) => {
            const course = courseMap.get(courseId)

            return (
              <li
                className="flex items-center justify-between gap-3 text-sm"
                key={courseId}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: course?.color ?? '#64748b' }}
                    aria-hidden
                  />
                  <span className="truncate">
                    {course?.title ?? '알 수 없는 강의'}
                  </span>
                </span>
                <span className="shrink-0 font-medium text-slate-900">
                  {formatHourText(minutes)}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-950">
          요일별 학습 시간
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
          {DAYS_OF_WEEK.map((dayOfWeek) => (
            <li
              className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm"
              key={dayOfWeek}
            >
              <span className="font-medium text-slate-600">
                {DAY_LABELS[dayOfWeek]}
              </span>
              <span className="font-semibold text-slate-950">
                {formatHourText(summary.minutesByDayOfWeek[dayOfWeek])}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
