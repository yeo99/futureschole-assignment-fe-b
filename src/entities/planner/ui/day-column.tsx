import type { CourseMap } from '@/entities/course/model/create-course-map'
import { DAY_LABELS } from '../model/constants'
import { calculateBlockLayout } from '../model/layout'
import {
  generateSlotStartTimes,
  getNextSlotEndTime,
} from '../model/time'
import type {
  DayOfWeek,
  DraftStudyBlock,
  NewStudyBlockPreset,
} from '../model/types'
import { StudyBlockCard } from './study-block-card'

interface DayColumnProps {
  blocks: DraftStudyBlock[]
  conflictClientIds?: ReadonlySet<DraftStudyBlock['clientId']>
  courseMap: CourseMap
  dayOfWeek: DayOfWeek
  selectedBlockClientId?: DraftStudyBlock['clientId'] | null
  onCreateBlockAtSlot?: (preset: NewStudyBlockPreset) => void
  onSelectBlock?: (block: DraftStudyBlock) => void
}

const slotStartTimes = generateSlotStartTimes()

export function DayColumn({
  blocks,
  conflictClientIds,
  courseMap,
  dayOfWeek,
  selectedBlockClientId,
  onCreateBlockAtSlot,
  onSelectBlock,
}: DayColumnProps) {
  return (
    <div className="relative h-full bg-white">
      <div className="absolute inset-0 grid grid-rows-24">
        {slotStartTimes.map((startTime) => {
          const endTime = getNextSlotEndTime(startTime)

          return (
            <button
              aria-label={`${DAY_LABELS[dayOfWeek]}요일 ${startTime} 학습 블록 추가`}
              className="border-b border-slate-100 text-left transition-colors hover:bg-slate-50 focus-visible:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-slate-500"
              key={startTime}
              onClick={() =>
                onCreateBlockAtSlot?.({
                  dayOfWeek,
                  startTime,
                  endTime,
                })
              }
              type="button"
            />
          )
        })}
      </div>

      {blocks.map((block) => {
        const layout = calculateBlockLayout(block)

        return (
          <StudyBlockCard
            block={block}
            courseMap={courseMap}
            isConflicted={conflictClientIds?.has(block.clientId)}
            isSelected={block.clientId === selectedBlockClientId}
            key={block.clientId}
            className="z-10"
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
