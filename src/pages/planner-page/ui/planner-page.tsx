import { useEffect, useMemo, useState } from 'react'
import { createCourseMap } from '@/entities/course/model/create-course-map'
import { useCoursesQuery } from '@/entities/course/model/queries'
import { usePlannerDraftStore } from '@/entities/planner/model/draft-store'
import { PLANNER_CONFIRM_MESSAGES } from '@/entities/planner/model/messages'
import { usePlannerQuery } from '@/entities/planner/model/queries'
import type {
  DraftStudyBlock,
  NewStudyBlockPreset,
} from '@/entities/planner/model/types'
import { formatISODate, getWeekStartDate } from '@/entities/planner/model/week'
import { WeekNavigator } from '@/features/change-planner-week/ui/week-navigator'
import { useSavePlannerDraft } from '@/features/planner-save/model/use-save-planner-draft'
import { PlannerSaveControls } from '@/features/planner-save/ui/planner-save-controls'
import { StudyBlockEditorModal } from '@/features/study-block-editor/ui/study-block-editor-modal'
import { getApiErrorMessage } from '@/shared/api/http-client'
import { InlineAlert } from '@/shared/ui/inline-alert'
import { LoadingState } from '@/shared/ui/loading-state'
import { PlannerShell } from '@/widgets/planner-shell/ui/planner-shell'
import { PlannerSummary } from '@/widgets/planner-summary/ui/planner-summary'
import { WeeklyPlannerGrid } from '@/widgets/weekly-planner-grid/ui/weekly-planner-grid'

const currentWeekStart = formatISODate(getWeekStartDate(new Date()))

export function PlannerPage() {
  const [weekStart, setWeekStart] = useState(currentWeekStart)
  const [selectedBlockClientId, setSelectedBlockClientId] = useState<
    DraftStudyBlock['clientId'] | null
  >(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isEditorDirty, setIsEditorDirty] = useState(false)
  const [newBlockPreset, setNewBlockPreset] =
    useState<NewStudyBlockPreset | null>(null)
  const coursesQuery = useCoursesQuery()
  const plannerQuery = usePlannerQuery(weekStart)
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
  const hasUnsavedChanges = isDirty || isEditorDirty

  useEffect(() => {
    if (!plannerQuery.data) {
      return
    }

    if (isDirty && draftWeekStart === plannerQuery.data.weekStart) {
      return
    }

    initializeDraftFromServer(plannerQuery.data)
  }, [draftWeekStart, initializeDraftFromServer, isDirty, plannerQuery.data])

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  const isLoading = coursesQuery.isLoading || plannerQuery.isLoading
  const error = coursesQuery.error ?? plannerQuery.error
  const effectiveSelectedBlockClientId = selectedBlock?.clientId ?? null
  const startCreateMode = (preset: NewStudyBlockPreset | null = null) => {
    setSelectedBlockClientId(null)
    setNewBlockPreset(preset)
    setIsEditorOpen(true)
  }
  const closeEditor = (options?: { skipDirtyConfirm?: boolean }) => {
    if (
      isEditorDirty &&
      !options?.skipDirtyConfirm &&
      !window.confirm(PLANNER_CONFIRM_MESSAGES.DISCARD_UNSAVED_CHANGES)
    ) {
      return
    }

    setIsEditorOpen(false)
    setIsEditorDirty(false)
    setSelectedBlockClientId(null)
    setNewBlockPreset(null)
  }
  const handleChangeWeekStart = (nextWeekStart: string) => {
    if (
      hasUnsavedChanges &&
      !window.confirm(PLANNER_CONFIRM_MESSAGES.DISCARD_UNSAVED_CHANGES)
    ) {
      return
    }

    closeEditor({ skipDirtyConfirm: true })
    setSelectedBlockClientId(null)
    setWeekStart(nextWeekStart)
  }

  return (
    <PlannerShell
      title="주간 학습 플래너"
      description="월요일부터 일요일까지의 학습 블록을 한 주 단위로 확인하고 편집합니다."
    >
      {isLoading ? <LoadingState title="플래너를 불러오는 중입니다." /> : null}

      {error ? (
        <InlineAlert variant="error">{getApiErrorMessage(error)}</InlineAlert>
      ) : null}

      <WeekNavigator
        disabled={isSaving}
        weekStart={weekStart}
        onChangeWeekStart={handleChangeWeekStart}
      />

      {!isLoading && !error ? (
        <section className="grid gap-4">
          {isDirty ? (
            <InlineAlert variant="warning">
              저장하지 않은 변경사항이 있습니다.
            </InlineAlert>
          ) : null}

          <PlannerSummary blocks={draftBlocks} courseMap={courseMap} />
          <div className="flex justify-end">
            <PlannerSaveControls
              isDirty={isDirty}
              isSaving={isSaving}
              lastErrorMessage={lastErrorMessage}
              lastSavedAt={lastSavedAt}
              onDiscard={discardDraftChanges}
              onSave={saveDraft}
            />
          </div>
          <WeeklyPlannerGrid
            blocks={draftBlocks}
            courseMap={courseMap}
            selectedBlockClientId={effectiveSelectedBlockClientId}
            onCreateBlockAtSlot={startCreateMode}
            onSelectBlock={(block) => {
              setNewBlockPreset(null)
              setSelectedBlockClientId(block.clientId)
              setIsEditorOpen(true)
            }}
          />
          <StudyBlockEditorModal
            blocks={draftBlocks}
            courses={courses}
            isOpen={isEditorOpen}
            newBlockPreset={newBlockPreset}
            selectedBlock={selectedBlock}
            onAddBlock={addDraftBlock}
            onClose={closeEditor}
            onFormDirtyChange={setIsEditorDirty}
            onRemoveBlock={removeDraftBlock}
            onUpdateBlock={updateDraftBlock}
          />
        </section>
      ) : null}
    </PlannerShell>
  )
}
