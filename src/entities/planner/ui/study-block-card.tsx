import type { CSSProperties } from 'react'
import type { CourseMap } from '@/entities/course/model/create-course-map'
import { cn } from '@/shared/lib/cn'
import type { DraftStudyBlock } from '../model/types'

interface StudyBlockCardProps {
  block: DraftStudyBlock
  courseMap: CourseMap
  isConflicted?: boolean
  isSelected?: boolean
  className?: string
  onSelect?: (block: DraftStudyBlock) => void
  style?: CSSProperties
}

export function StudyBlockCard({
  block,
  courseMap,
  isConflicted = false,
  isSelected = false,
  className,
  onSelect,
  style,
}: StudyBlockCardProps) {
  const course = courseMap.get(block.courseId)

  return (
    <button
      className={cn(
        'absolute left-1 right-1 overflow-hidden rounded-md border bg-white p-2 text-left shadow-sm transition',
        'hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700',
        isConflicted ? 'border-red-500 bg-red-50 ring-1 ring-red-500' : null,
        isSelected ? 'ring-2 ring-slate-900 ring-offset-1' : null,
        className,
      )}
      aria-label={`${course?.title ?? '알 수 없는 강의'} ${block.startTime}부터 ${block.endTime}까지${
        isConflicted ? ', 시간 충돌 있음' : ''
      }`}
      aria-pressed={isSelected}
      onClick={() => onSelect?.(block)}
      style={{
        borderColor: isConflicted ? undefined : (course?.color ?? '#64748b'),
        backgroundColor: isConflicted
          ? undefined
          : `${course?.color ?? '#64748b'}18`,
        ...style,
      }}
      type="button"
    >
      <span className="block truncate text-xs font-semibold text-slate-950">
        {course?.title ?? '알 수 없는 강의'}
      </span>
      <span className="mt-1 block truncate text-xs text-slate-700">
        {block.startTime} - {block.endTime}
      </span>
      {isConflicted ? (
        <span className="mt-1 inline-flex rounded-sm bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          시간 충돌
        </span>
      ) : null}
      {block.memo ? (
        <span className="mt-1 block truncate text-xs text-slate-500">
          {block.memo}
        </span>
      ) : null}
    </button>
  )
}
