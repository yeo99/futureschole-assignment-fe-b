import type { CSSProperties } from 'react'
import type { CourseMap } from '@/entities/course/model/create-course-map'
import { cn } from '@/shared/lib/cn'
import type { DraftStudyBlock } from '../model/types'

interface StudyBlockCardProps {
  block: DraftStudyBlock
  courseMap: CourseMap
  isSelected?: boolean
  className?: string
  onSelect?: (block: DraftStudyBlock) => void
  style?: CSSProperties
}

export function StudyBlockCard({
  block,
  courseMap,
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
        isSelected ? 'ring-2 ring-slate-900 ring-offset-1' : null,
        className,
      )}
      aria-pressed={isSelected}
      onClick={() => onSelect?.(block)}
      style={{
        borderColor: course?.color ?? '#64748b',
        backgroundColor: `${course?.color ?? '#64748b'}18`,
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
      {block.memo ? (
        <span className="mt-1 block truncate text-xs text-slate-500">
          {block.memo}
        </span>
      ) : null}
    </button>
  )
}
