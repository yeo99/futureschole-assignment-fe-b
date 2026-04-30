import { useEffect, useMemo, useState } from 'react'
import { createCourseMap } from '@/entities/course/model/create-course-map'
import { useCoursesQuery } from '@/entities/course/model/queries'
import { usePlannerDraftStore } from '@/entities/planner/model/draft-store'
import { usePlannerQuery } from '@/entities/planner/model/queries'
import type { DraftStudyBlock } from '@/entities/planner/model/types'
import { formatISODate, getWeekStartDate } from '@/entities/planner/model/week'
import { useSavePlannerDraft } from '@/features/planner-save/model/use-save-planner-draft'
import { PlannerSaveControls } from '@/features/planner-save/ui/planner-save-controls'
import { StudyBlockEditorPanel } from '@/features/study-block-editor/ui/study-block-editor-panel'
import { getApiErrorMessage } from '@/shared/api/http-client'
import { InlineAlert } from '@/shared/ui/inline-alert'
import { LoadingState } from '@/shared/ui/loading-state'
import { PlannerShell } from '@/widgets/planner-shell/ui/planner-shell'
import { PlannerSummary } from '@/widgets/planner-summary/ui/planner-summary'
import { WeeklyPlannerGrid } from '@/widgets/weekly-planner-grid/ui/weekly-planner-grid'

const currentWeekStart = formatISODate(getWeekStartDate(new Date()))

export function PlannerPage() {
  const [selectedBlockClientId, setSelectedBlockClientId] = useState<
    DraftStudyBlock['clientId'] | null
  >(null)
  const coursesQuery = useCoursesQuery()
  const plannerQuery = usePlannerQuery(currentWeekStart)
  const draftWeekStart = usePlannerDraftStore((state) => state.weekStart)
  const isDirty = usePlannerDraftStore((state) => state.isDirty)
  const draftBlocks = usePlannerDraftStore((state) => state.blocks)
  const lastSavedAt = usePlannerDraftStore((state) => state.lastSavedAt)
  const lastErrorMessage = usePlannerDraftStore((state) => state.lastErrorMessage)
  const addDraftBlock = usePlannerDraftStore((state) => state.addDraftBlock)
  const updateDraftBlock = usePlannerDraftStore((state) => state.updateDraftBlock)
  const removeDraftBlock = usePlannerDraftStore((state) => state.removeDraftBlock)
  const discardDraftChanges = usePlannerDraftStore(
    (state) => state.discardDraftChanges,
  )
  const initializeDraftFromServer = usePlannerDraftStore(
    (state) => state.initializeDraftFromServer,
  )
  const { isSaving, saveDraft } = useSavePlannerDraft()
  const courseMap = useMemo(
    () => createCourseMap(coursesQuery.data?.courses ?? []),
    [coursesQuery.data?.courses],
  )
  const courses = coursesQuery.data?.courses ?? []
  const selectedBlock = useMemo(
    () =>
      draftBlocks.find((block) => block.clientId === selectedBlockClientId) ??
      null,
    [draftBlocks, selectedBlockClientId],
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
  const effectiveSelectedBlockClientId = selectedBlock?.clientId ?? null

  return (
    <PlannerShell
      title="주간 학습 플래너"
      description="월요일부터 일요일까지의 학습 블록을 한 주 단위로 확인하고 편집합니다."
      toolbar={
        !isLoading && !error ? (
          <PlannerSaveControls
            isDirty={isDirty}
            isSaving={isSaving}
            lastErrorMessage={lastErrorMessage}
            lastSavedAt={lastSavedAt}
            onDiscard={discardDraftChanges}
            onSave={saveDraft}
          />
        ) : null
      }
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
          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <WeeklyPlannerGrid
              blocks={draftBlocks}
              courseMap={courseMap}
              selectedBlockClientId={effectiveSelectedBlockClientId}
              onSelectBlock={(block) => setSelectedBlockClientId(block.clientId)}
            />
            <StudyBlockEditorPanel
              blocks={draftBlocks}
              courses={courses}
              selectedBlock={selectedBlock}
              onAddBlock={addDraftBlock}
              onCreateMode={() => setSelectedBlockClientId(null)}
              onRemoveBlock={removeDraftBlock}
              onUpdateBlock={updateDraftBlock}
            />
          </div>
        </section>
      ) : null}
    </PlannerShell>
  )
}
