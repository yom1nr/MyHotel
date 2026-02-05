import type { ComponentType, ReactNode } from 'react'

type Props = {
  label: string
  value: ReactNode
  sub: string
  icon: ComponentType<{ className?: string }>
  accentClassName: string
  progressPercent?: number
}

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accentClassName,
  progressPercent,
}: Props) {
  const pct = Math.max(0, Math.min(100, progressPercent ?? 0))

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500">{label}</div>
          <div className="mt-1 flex items-end gap-1">
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="pb-1 text-xs text-slate-500">{sub}</div>
          </div>
        </div>

        <div
          className={
            'flex h-10 w-10 items-center justify-center rounded-2xl text-white ' +
            accentClassName
          }
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {typeof progressPercent === 'number' ? (
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-emerald-600"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-500">อัปเดตล่าสุด: วันนี้</div>
        </div>
      ) : null}
    </div>
  )
}
