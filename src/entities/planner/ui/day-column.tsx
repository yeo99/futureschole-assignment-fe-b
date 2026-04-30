import type { CourseMap } from '@/entities/course/model/create-course-map'
import { calculateBlockLayout } from '../model/layout'
import type { DraftStudyBlock } from '../model/types'
import { StudyBlockCard } from './study-block-card'

interface DayColumnProps {
  blocks: DraftStudyBlock[]
  courseMap: CourseMap
  selectedBlockClientId?: DraftStudyBlock['clientId'] | null
  onSelectBlock?: (block: DraftStudyBlock) => void
}

export function DayColumn({
  blocks,
  courseMap,
  selectedBlockClientId,
  onSelectBlock,
}: DayColumnProps) {
  return (
    <div className="relative h-full bg-white">
      <div className="absolute inset-0 grid grid-rows-12">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            className="border-b border-slate-100 last:border-b-0"
            key={index}
          />
        ))}
      </div>

      {blocks.map((block) => {
        const layout = calculateBlockLayout(block)

        return (
          <StudyBlockCard
            block={block}
            courseMap={courseMap}
            isSelected={block.clientId === selectedBlockClientId}
            key={block.clientId}
            onSelect={onSelectBlock}
            style={{
              top: `${layout.topPercent}%`,
              height: `${layout.heightPercent}%`,
            }}
          />
        )
      })}
    </div>
  )
}
