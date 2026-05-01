import { Save, Undo2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { InlineAlert } from '@/shared/ui/inline-alert'
import { PLANNER_SAVE_MESSAGES } from '../model/messages'

interface PlannerSaveControlsProps {
  isDirty: boolean
  isSaving: boolean
  lastErrorMessage: string | null
  lastSavedAt: string | null
  onDiscard: () => void
  onSave: () => void
}

function formatSavedAt(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))
}

export function PlannerSaveControls({
  isDirty,
  isSaving,
  lastErrorMessage,
  lastSavedAt,
  onDiscard,
  onSave,
}: PlannerSaveControlsProps) {
  return (
    <div className="flex w-full flex-col items-stretch gap-2 md:w-auto md:items-end">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          disabled={!isDirty}
          leftIcon={<Undo2 className="size-4" aria-hidden />}
          onClick={onDiscard}
          type="button"
          variant="secondary"
        >
          {PLANNER_SAVE_MESSAGES.DISCARD_BUTTON}
        </Button>
        <Button
          disabled={!isDirty}
          isLoading={isSaving}
          leftIcon={<Save className="size-4" aria-hidden />}
          onClick={onSave}
          type="button"
        >
          {PLANNER_SAVE_MESSAGES.SAVE_BUTTON}
        </Button>
      </div>

      {lastErrorMessage ? (
        <InlineAlert className="max-w-sm" variant="error">
          {lastErrorMessage}
        </InlineAlert>
      ) : null}

      {!lastErrorMessage && lastSavedAt ? (
        <p className="text-xs font-medium text-slate-500" role="status">
          {PLANNER_SAVE_MESSAGES.LAST_SAVED_PREFIX} {formatSavedAt(lastSavedAt)}
        </p>
      ) : null}
    </div>
  )
}
