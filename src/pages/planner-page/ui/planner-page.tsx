import { useEffect, useMemo } from 'react'
import { createCourseMap } from '@/entities/course/model/create-course-map'
import { useCoursesQuery } from '@/entities/course/model/queries'
import { usePlannerDraftStore } from '@/entities/planner/model/draft-store'
import { usePlannerQuery } from '@/entities/planner/model/queries'
import { formatISODate, getWeekStartDate } from '@/entities/planner/model/week'
import { getApiErrorMessage } from '@/shared/api/http-client'
import { InlineAlert } from '@/shared/ui/inline-alert'
import { LoadingState } from '@/shared/ui/loading-state'
import { PlannerShell } from '@/widgets/planner-shell/ui/planner-shell'
import { PlannerSummary } from '@/widgets/planner-summary/ui/planner-summary'

const currentWeekStart = formatISODate(getWeekStartDate(new Date()))

export function PlannerPage() {
  const coursesQuery = useCoursesQuery()
  const plannerQuery = usePlannerQuery(currentWeekStart)
  const draftWeekStart = usePlannerDraftStore((state) => state.weekStart)
  const isDirty = usePlannerDraftStore((state) => state.isDirty)
  const draftBlocks = usePlannerDraftStore((state) => state.blocks)
  const initializeDraftFromServer = usePlannerDraftStore(
    (state) => state.initializeDraftFromServer,
  )
  const courseMap = useMemo(
    () => createCourseMap(coursesQuery.data?.courses ?? []),
    [coursesQuery.data?.courses],
  )

  useEffect(() => {
    if (!plannerQuery.data) {
      return
    }

    if (isDirty && draftWeekStart === plannerQuery.data.weekStart) {
      return
    }

    initializeDraftFromServer(plannerQuery.data)
  }, [draftWeekStart, initializeDraftFromServer, isDirty, plannerQuery.data])

  const isLoading = coursesQuery.isLoading || plannerQuery.isLoading
  const error = coursesQuery.error ?? plannerQuery.error

  return (
    <PlannerShell
      title="주간 학습 플래너"
      description="월요일부터 일요일까지의 학습 블록을 편집하고 한 번에 저장합니다."
    >
      {isLoading ? <LoadingState title="플래너를 불러오는 중입니다." /> : null}

      {error ? (
        <InlineAlert variant="error">{getApiErrorMessage(error)}</InlineAlert>
      ) : null}

      {!isLoading && !error ? (
        <section className="grid gap-4">
          {isDirty ? (
            <InlineAlert variant="warning">
              저장하지 않은 변경사항이 있습니다.
            </InlineAlert>
          ) : null}

          <PlannerSummary blocks={draftBlocks} courseMap={courseMap} />
        </section>
      ) : null}
    </PlannerShell>
  )
}
