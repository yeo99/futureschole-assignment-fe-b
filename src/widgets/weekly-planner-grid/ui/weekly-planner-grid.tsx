import type { CourseMap } from '@/entities/course/model/create-course-map'
import { DAY_LABELS, DAYS_OF_WEEK } from '@/entities/planner/model/constants'
import { groupBlocksByDay } from '@/entities/planner/model/grouping'
import type { DraftStudyBlock } from '@/entities/planner/model/types'
import { DayColumn } from '@/entities/planner/ui/day-column'
import { TimeAxis } from '@/entities/planner/ui/time-axis'

interface WeeklyPlannerGridProps {
  blocks: DraftStudyBlock[]
  courseMap: CourseMap
  selectedBlockClientId?: DraftStudyBlock['clientId'] | null
  onSelectBlock?: (block: DraftStudyBlock) => void
}

export function WeeklyPlannerGrid({
  blocks,
  courseMap,
  selectedBlockClientId,
  onSelectBlock,
}: WeeklyPlannerGridProps) {
  const blocksByDay = groupBlocksByDay(blocks)

  return (
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="grid min-w-[996px] grid-cols-[72px_repeat(7,minmax(132px,1fr))] border-b border-slate-200 bg-slate-50">
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

      <div className="overflow-x-auto">
        <div className="grid h-[720px] min-w-[996px] grid-cols-[72px_repeat(7,minmax(132px,1fr))]">
          <TimeAxis />
          {DAYS_OF_WEEK.map((dayOfWeek) => (
            <div
              className="border-r border-slate-100 last:border-r-0"
              key={dayOfWeek}
            >
              <DayColumn
                blocks={blocksByDay[dayOfWeek] ?? []}
                courseMap={courseMap}
                selectedBlockClientId={selectedBlockClientId}
                onSelectBlock={onSelectBlock}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
