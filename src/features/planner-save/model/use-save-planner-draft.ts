import { useQueryClient } from '@tanstack/react-query'
import { findDraftConflictClientIds } from '@/entities/planner/model/draft-validation'
import { usePlannerDraftStore } from '@/entities/planner/model/draft-store'
import { PLANNER_VALIDATION_MESSAGES } from '@/entities/planner/model/messages'
import { useSavePlannerMutation } from '@/entities/planner/model/queries'
import { getApiErrorMessage } from '@/shared/api/http-client'
import { QUERY_KEYS } from '@/shared/api/query-keys'
import { createSavePlannerRequest } from './create-save-planner-request'

export function useSavePlannerDraft() {
  const queryClient = useQueryClient()
  const weekStart = usePlannerDraftStore((state) => state.weekStart)
  const blocks = usePlannerDraftStore((state) => state.blocks)
  const replaceDraftAfterSave = usePlannerDraftStore(
    (state) => state.replaceDraftAfterSave,
  )
  const setSaveError = usePlannerDraftStore((state) => state.setSaveError)
  const savePlannerMutation = useSavePlannerMutation()

  const saveDraft = () => {
    if (!weekStart) {
      return
    }

    if (findDraftConflictClientIds(blocks).size > 0) {
      setSaveError(PLANNER_VALIDATION_MESSAGES.TIME_CONFLICT)
      return
    }

    savePlannerMutation.mutate(createSavePlannerRequest(weekStart, blocks), {
      onSuccess: (response) => {
        queryClient.setQueryData(QUERY_KEYS.planner.byWeek(response.weekStart), response)
        replaceDraftAfterSave(response)
      },
      onError: (error) => {
        setSaveError(getApiErrorMessage(error))
      },
    })
  }

  return {
    saveDraft,
    isSaving: savePlannerMutation.isPending,
  }
}
