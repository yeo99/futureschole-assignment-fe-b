import { useId, useMemo, useState } from 'react'
import type { CourseMap } from '@/entities/course/model/create-course-map'
import { DAY_LABELS, DAYS_OF_WEEK } from '@/entities/planner/model/constants'
import { findDraftConflictClientIds } from '@/entities/planner/model/draft-validation'
import { groupBlocksByDay } from '@/entities/planner/model/grouping'
import type {
  DayOfWeek,
  DraftStudyBlock,
  NewStudyBlockPreset,
} from '@/entities/planner/model/types'
import { DayColumn } from '@/entities/planner/ui/day-column'
import { TimeAxis } from '@/entities/planner/ui/time-axis'

interface WeeklyPlannerGridProps {
  blocks: DraftStudyBlock[]
  courseMap: CourseMap
  selectedBlockClientId?: DraftStudyBlock['clientId'] | null
  onCreateBlockAtSlot?: (preset: NewStudyBlockPreset) => void
  onSelectBlock?: (block: DraftStudyBlock) => void
}

export function WeeklyPlannerGrid({
  blocks,
  courseMap,
  selectedBlockClientId,
  onCreateBlockAtSlot,
  onSelectBlock,
}: WeeklyPlannerGridProps) {
  const daySelectId = useId()
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<DayOfWeek>(0)
  const blocksByDay = groupBlocksByDay(blocks)
  const conflictClientIds = useMemo(
    () => findDraftConflictClientIds(blocks),
    [blocks],
  )

  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3 lg:hidden">
        <label
          className="mb-1 block text-sm font-medium text-slate-700"
          htmlFor={daySelectId}
        >
          표시할 요일
        </label>
        <select
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
          id={daySelectId}
          onChange={(event) =>
            setSelectedDayOfWeek(Number(event.target.value) as DayOfWeek)
          }
          value={selectedDayOfWeek}
        >
          {DAYS_OF_WEEK.map((dayOfWeek) => (
            <option key={dayOfWeek} value={dayOfWeek}>
              {DAY_LABELS[dayOfWeek]}
            </option>
          ))}
        </select>
      </div>

      <div className="lg:hidden">
        <div className="grid h-[720px] grid-cols-[72px_minmax(0,1fr)]">
          <TimeAxis />
          <DayColumn
            blocks={blocksByDay[selectedDayOfWeek] ?? []}
            conflictClientIds={conflictClientIds}
            courseMap={courseMap}
            dayOfWeek={selectedDayOfWeek}
            onCreateBlockAtSlot={onCreateBlockAtSlot}
            selectedBlockClientId={selectedBlockClientId}
            onSelectBlock={onSelectBlock}
          />
        </div>
      </div>

      <div className="hidden overflow-hidden lg:block">
        <div className="overflow-x-auto">
          <div className="min-w-[996px]">
            <div className="grid grid-cols-[72px_repeat(7,minmax(132px,1fr))] border-b border-slate-200 bg-slate-50">
              <div className="border-r border-slate-200 px-3 py-3 text-xs font-semibold text-slate-500">
                시간
              </div>
              {DAYS_OF_WEEK.map((dayOfWeek) => (
                <div
                  className="border-r border-slate-200 px-3 py-3 text-center text-sm font-semibold text-slate-900 last:border-r-0"
                  key={dayOfWeek}
                >
                  {DAY_LABELS[dayOfWeek]}
                </div>
              ))}
            </div>

            <div className="grid h-[720px] grid-cols-[72px_repeat(7,minmax(132px,1fr))]">
              <TimeAxis />
              {DAYS_OF_WEEK.map((dayOfWeek) => (
                <div
                  className="border-r border-slate-100 last:border-r-0"
                  key={dayOfWeek}
                >
                  <DayColumn
                    blocks={blocksByDay[dayOfWeek] ?? []}
                    conflictClientIds={conflictClientIds}
                    courseMap={courseMap}
                    dayOfWeek={dayOfWeek}
                    onCreateBlockAtSlot={onCreateBlockAtSlot}
                    selectedBlockClientId={selectedBlockClientId}
                    onSelectBlock={onSelectBlock}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
