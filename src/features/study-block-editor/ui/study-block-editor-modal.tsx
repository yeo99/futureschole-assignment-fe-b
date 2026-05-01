import { zodResolver } from '@hookform/resolvers/zod'
import { RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useId, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { Course } from '@/entities/course/model/types'
import {
  DAY_LABELS,
  DAYS_OF_WEEK,
  MAX_MEMO_LENGTH,
} from '@/entities/planner/model/constants'
import { hasDraftTimeConflict } from '@/entities/planner/model/draft-validation'
import {
  PLANNER_CONFIRM_MESSAGES,
  PLANNER_VALIDATION_MESSAGES,
} from '@/entities/planner/model/messages'
import { generateTimeOptions } from '@/entities/planner/model/time'
import type {
  DraftStudyBlock,
  NewStudyBlockPreset,
  SavePlannerBlockRequest,
} from '@/entities/planner/model/types'
import { Button } from '@/shared/ui/button'
import { FieldError } from '@/shared/ui/field-error'
import { Modal } from '@/shared/ui/modal'
import { Textarea } from '@/shared/ui/textarea'
import {
  studyBlockFormSchema,
  type StudyBlockFormInput,
  type StudyBlockFormValues,
} from '../model/study-block-form-schema'

interface StudyBlockEditorModalProps {
  blocks: DraftStudyBlock[]
  courses: Course[]
  isOpen: boolean
  newBlockPreset: NewStudyBlockPreset | null
  selectedBlock: DraftStudyBlock | null
  onAddBlock: (block: SavePlannerBlockRequest) => void
  onClose: (options?: { skipDirtyConfirm?: boolean }) => void
  onFormDirtyChange: (isFormDirty: boolean) => void
  onRemoveBlock: (clientId: DraftStudyBlock['clientId']) => void
  onUpdateBlock: (
    clientId: DraftStudyBlock['clientId'],
    block: SavePlannerBlockRequest,
  ) => void
}

const timeOptions = generateTimeOptions()

function createFormDefaultValues(
  block: DraftStudyBlock | null,
  preset: NewStudyBlockPreset | null,
): StudyBlockFormInput {
  return {
    courseId: block?.courseId ?? '',
    dayOfWeek: block
      ? String(block.dayOfWeek)
      : preset
        ? String(preset.dayOfWeek)
        : '',
    startTime: block?.startTime ?? preset?.startTime ?? '09:00',
    endTime: block?.endTime ?? preset?.endTime ?? '10:00',
    memo: block?.memo ?? '',
  }
}

function toSaveRequest(
  values: StudyBlockFormValues,
  selectedBlock: DraftStudyBlock | null,
): SavePlannerBlockRequest {
  return {
    id: selectedBlock?.id,
    courseId: values.courseId,
    dayOfWeek: values.dayOfWeek,
    startTime: values.startTime,
    endTime: values.endTime,
    memo: values.memo?.trim() || undefined,
  }
}

export function StudyBlockEditorModal({
  blocks,
  courses,
  isOpen,
  newBlockPreset,
  selectedBlock,
  onAddBlock,
  onClose,
  onFormDirtyChange,
  onRemoveBlock,
  onUpdateBlock,
}: StudyBlockEditorModalProps) {
  const formId = useId()
  const fieldId = useMemo(
    () => ({
      courseId: `${formId}-course`,
      dayOfWeek: `${formId}-day`,
      startTime: `${formId}-start-time`,
      endTime: `${formId}-end-time`,
      memo: `${formId}-memo`,
      memoCounter: `${formId}-memo-counter`,
    }),
    [formId],
  )
  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<StudyBlockFormInput, unknown, StudyBlockFormValues>({
    resolver: zodResolver(studyBlockFormSchema),
    defaultValues: createFormDefaultValues(selectedBlock, newBlockPreset),
  })
  const isEditing = selectedBlock !== null
  const memoLength = (useWatch({ control, name: 'memo' }) ?? '').length
  const isMemoLengthExceeded = memoLength > MAX_MEMO_LENGTH
  const memoDescriptionIds = [
    fieldId.memoCounter,
    errors.memo ? `${fieldId.memo}-error` : null,
  ]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    reset(createFormDefaultValues(selectedBlock, newBlockPreset))
  }, [newBlockPreset, reset, selectedBlock])

  useEffect(() => {
    onFormDirtyChange(isOpen ? isDirty : false)
  }, [isDirty, isOpen, onFormDirtyChange])

  const submitForm = handleSubmit((values) => {
    const hasConflict = hasDraftTimeConflict(
      {
        clientId: selectedBlock?.clientId,
        dayOfWeek: values.dayOfWeek,
        startTime: values.startTime,
        endTime: values.endTime,
      },
      blocks,
    )

    if (hasConflict) {
      setError('endTime', {
        type: 'validate',
        message: PLANNER_VALIDATION_MESSAGES.TIME_CONFLICT,
      })
      return
    }

    const request = toSaveRequest(values, selectedBlock)

    if (selectedBlock) {
      onUpdateBlock(selectedBlock.clientId, request)
    } else {
      onAddBlock(request)
    }

    reset(createFormDefaultValues(null, null))
    onFormDirtyChange(false)
    onClose({ skipDirtyConfirm: true })
  })

  const handleRemoveBlock = () => {
    if (!selectedBlock) {
      return
    }

    if (!window.confirm(PLANNER_CONFIRM_MESSAGES.DELETE_BLOCK)) {
      return
    }

    onRemoveBlock(selectedBlock.clientId)
    onFormDirtyChange(false)
    onClose({ skipDirtyConfirm: true })
  }

  return (
    <Modal
      isOpen={isOpen}
      title={isEditing ? '학습 블록 수정' : '학습 블록 추가'}
      description="강의, 요일, 시간을 입력하면 저장 전 draft에 먼저 반영됩니다."
      onClose={() => onClose()}
    >
      <form className="grid gap-4" onSubmit={submitForm}>
        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor={fieldId.courseId}
          >
            강의
          </label>
          <select
            aria-describedby={
              errors.courseId ? `${fieldId.courseId}-error` : undefined
            }
            aria-invalid={!!errors.courseId || undefined}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
            id={fieldId.courseId}
            {...register('courseId')}
          >
            <option value="">강의 선택</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <FieldError
            id={`${fieldId.courseId}-error`}
            message={errors.courseId?.message}
          />
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor={fieldId.dayOfWeek}
          >
            요일
          </label>
          <select
            aria-describedby={
              errors.dayOfWeek ? `${fieldId.dayOfWeek}-error` : undefined
            }
            aria-invalid={!!errors.dayOfWeek || undefined}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
            id={fieldId.dayOfWeek}
            {...register('dayOfWeek')}
          >
            <option value="">요일 선택</option>
            {DAYS_OF_WEEK.map((dayOfWeek) => (
              <option key={dayOfWeek} value={dayOfWeek}>
                {DAY_LABELS[dayOfWeek]}
              </option>
            ))}
          </select>
          <FieldError
            id={`${fieldId.dayOfWeek}-error`}
            message={errors.dayOfWeek?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor={fieldId.startTime}
            >
              시작
            </label>
            <select
              aria-describedby={
                errors.startTime ? `${fieldId.startTime}-error` : undefined
              }
              aria-invalid={!!errors.startTime || undefined}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
              id={fieldId.startTime}
              {...register('startTime')}
            >
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            <FieldError
              id={`${fieldId.startTime}-error`}
              message={errors.startTime?.message}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor={fieldId.endTime}
            >
              종료
            </label>
            <select
              aria-describedby={
                errors.endTime ? `${fieldId.endTime}-error` : undefined
              }
              aria-invalid={!!errors.endTime || undefined}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
              id={fieldId.endTime}
              {...register('endTime')}
            >
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            <FieldError
              id={`${fieldId.endTime}-error`}
              message={errors.endTime?.message}
            />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between gap-3">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor={fieldId.memo}
            >
              메모
            </label>
            <span
              className={
                isMemoLengthExceeded
                  ? 'text-xs font-medium text-red-600'
                  : 'text-xs font-medium text-slate-500'
              }
              id={fieldId.memoCounter}
            >
              {memoLength}/{MAX_MEMO_LENGTH}
            </span>
          </div>
          <Textarea
            aria-describedby={memoDescriptionIds}
            id={fieldId.memo}
            isInvalid={!!errors.memo}
            placeholder="학습 목표나 참고 내용을 입력하세요."
            {...register('memo')}
          />
          <FieldError id={`${fieldId.memo}-error`} message={errors.memo?.message} />
        </div>

        <div className="grid gap-2 pt-1 sm:grid-cols-2">
          <Button isLoading={isSubmitting} type="submit">
            {isEditing ? '변경사항 반영' : '블록 추가'}
          </Button>
          <Button
            leftIcon={<RotateCcw className="size-4" aria-hidden />}
            onClick={() =>
              reset(createFormDefaultValues(selectedBlock, newBlockPreset))
            }
            type="button"
            variant="secondary"
          >
            입력값 되돌리기
          </Button>
          {isEditing ? (
            <Button
              className="sm:col-span-2"
              leftIcon={<Trash2 className="size-4" aria-hidden />}
              onClick={handleRemoveBlock}
              type="button"
              variant="danger"
            >
              블록 삭제
            </Button>
          ) : null}
        </div>
      </form>
    </Modal>
  )
}
