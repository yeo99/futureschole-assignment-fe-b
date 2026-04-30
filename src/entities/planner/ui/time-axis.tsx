import { PLANNER_END_TIME, PLANNER_START_TIME } from '../model/constants'
import { generateTimeOptions } from '../model/time'

const hourOptions = generateTimeOptions(PLANNER_START_TIME, PLANNER_END_TIME, 60)

export function TimeAxis() {
  return (
    <div className="relative h-full border-r border-slate-200 bg-slate-50">
      {hourOptions.map((time, index) => (
        <div
          className="absolute left-0 right-0 -translate-y-2 pr-2 text-right text-[11px] font-medium text-slate-500"
          key={time}
          style={{
            top: `${(index / (hourOptions.length - 1)) * 100}%`,
          }}
        >
          {time}
        </div>
      ))}
    </div>
  )
}
