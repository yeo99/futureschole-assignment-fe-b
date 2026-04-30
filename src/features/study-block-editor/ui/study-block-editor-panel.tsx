import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useId, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { Course } from '@/entities/course/model/types'
import { DAY_LABELS, DAYS_OF_WEEK } from '@/entities/planner/model/constants'
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
import { Textarea } from '@/shared/ui/textarea'
import {
  studyBlockFormSchema,
  type StudyBlockFormInput,
  type StudyBlockFormValues,
} from '../model/study-block-form-schema'

interface StudyBlockEditorPanelProps {
  blocks: DraftStudyBlock[]
  courses: Course[]
  newBlockPreset: NewStudyBlockPreset | null
  selectedBlock: DraftStudyBlock | null
  onCreateMode: () => void
  onAddBlock: (block: SavePlannerBlockRequest) => void
  onUpdateBlock: (
    clientId: DraftStudyBlock['clientId'],
    block: SavePlannerBlockRequest,
  ) => void
  onRemoveBlock: (clientId: DraftStudyBlock['clientId']) => void
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

export function StudyBlockEditorPanel({
  blocks,
  courses,
  newBlockPreset,
  selectedBlock,
  onCreateMode,
  onAddBlock,
  onUpdateBlock,
  onRemoveBlock,
}: StudyBlockEditorPanelProps) {
  const formId = useId()
  const fieldId = useMemo(
    () => ({
      courseId: `${formId}-course`,
      dayOfWeek: `${formId}-day`,
      startTime: `${formId}-start-time`,
      endTime: `${formId}-end-time`,
      memo: `${formId}-memo`,
      formError: `${formId}-form-error`,
    }),
    [formId],
  )
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<StudyBlockFormInput, unknown, StudyBlockFormValues>({
    resolver: zodResolver(studyBlockFormSchema),
    defaultValues: createFormDefaultValues(selectedBlock, newBlockPreset),
  })
  const isEditing = selectedBlock !== null

  useEffect(() => {
    reset(createFormDefaultValues(selectedBlock, newBlockPreset))
  }, [newBlockPreset, reset, selectedBlock])

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

    if (!selectedBlock) {
      onCreateMode()
      reset(createFormDefaultValues(null, null))
    }
  })

  const handleRemoveBlock = () => {
    if (!selectedBlock) {
      return
    }

    if (!window.confirm(PLANNER_CONFIRM_MESSAGES.DELETE_BLOCK)) {
      return
    }

    onRemoveBlock(selectedBlock.clientId)
    onCreateMode()
  }

  return (
    <aside className="rounded-md border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            {isEditing ? '학습 블록 수정' : '학습 블록 추가'}
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            강의, 요일, 시간을 입력하면 저장 전 draft에 먼저 반영됩니다.
          </p>
        </div>
        {isEditing ? (
          <Button
            aria-label="새 학습 블록 입력"
            className="size-9 shrink-0 px-0"
            onClick={onCreateMode}
            variant="ghost"
          >
            <Plus className="size-4" aria-hidden />
          </Button>
        ) : null}
      </div>

      <form className="grid gap-4" onSubmit={submitForm}>
        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor={fieldId.courseId}
          >
            강의
          </label>
          <select
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
            id={fieldId.courseId}
            {...register('courseId')}
            aria-describedby={errors.courseId ? `${fieldId.courseId}-error` : undefined}
            aria-invalid={!!errors.courseId || undefined}
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
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
            id={fieldId.dayOfWeek}
            {...register('dayOfWeek')}
            aria-describedby={errors.dayOfWeek ? `${fieldId.dayOfWeek}-error` : undefined}
            aria-invalid={!!errors.dayOfWeek || undefined}
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
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
              id={fieldId.startTime}
              {...register('startTime')}
              aria-describedby={
                errors.startTime ? `${fieldId.startTime}-error` : undefined
              }
              aria-invalid={!!errors.startTime || undefined}
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
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
              id={fieldId.endTime}
              {...register('endTime')}
              aria-describedby={errors.endTime ? `${fieldId.endTime}-error` : undefined}
              aria-invalid={!!errors.endTime || undefined}
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
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor={fieldId.memo}
          >
            메모
          </label>
          <Textarea
            id={fieldId.memo}
            placeholder="학습 목표나 참고 내용을 입력하세요."
            {...register('memo')}
            aria-describedby={errors.memo ? `${fieldId.memo}-error` : undefined}
            isInvalid={!!errors.memo}
          />
          <FieldError id={`${fieldId.memo}-error`} message={errors.memo?.message} />
        </div>

        <div className="grid gap-2 pt-1">
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
    </aside>
  )
}
