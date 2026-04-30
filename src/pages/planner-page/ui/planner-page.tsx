import { useEffect } from 'react'
import { useCoursesQuery } from '@/entities/course/model/queries'
import { usePlannerQuery } from '@/entities/planner/model/queries'
import { usePlannerDraftStore } from '@/entities/planner/model/draft-store'
import { formatISODate, getWeekStartDate } from '@/entities/planner/model/week'
import { getApiErrorMessage } from '@/shared/api/http-client'
import { EmptyState } from '@/shared/ui/empty-state'
import { InlineAlert } from '@/shared/ui/inline-alert'
import { LoadingState } from '@/shared/ui/loading-state'
import { PlannerShell } from '@/widgets/planner-shell/ui/planner-shell'

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
          <InlineAlert variant={isDirty ? 'warning' : 'success'}>
            {isDirty
              ? '저장하지 않은 변경사항이 있습니다.'
              : '서버에 저장된 일정과 동기화된 상태입니다.'}
          </InlineAlert>

          {draftBlocks.length === 0 ? (
            <EmptyState
              title="등록된 학습 블록이 없습니다."
              description="시간표에서 빈 시간을 선택해 학습 블록을 추가할 수 있습니다."
            />
          ) : (
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <p className="text-sm font-medium text-slate-900">
                현재 draft 블록 {draftBlocks.length}개
              </p>
            </div>
          )}
        </section>
      ) : null}
    </PlannerShell>
  )
}
