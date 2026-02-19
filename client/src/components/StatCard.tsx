import type { ComponentType, ReactNode } from 'react'

type Props = {
  label: string
  value: ReactNode
  sub: string
  icon: ComponentType<{ className?: string }>
  accentClassName: string
  progressPercent?: number
  gradient?: string
}

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  progressPercent,
  gradient = 'from-indigo-500 to-cyan-500',
}: Props) {
  const pct = Math.max(0, Math.min(100, progressPercent ?? 0))

  return (
    <div className="glass-card p-5 transition-all duration-300 hover:border-white/[0.12] hover:shadow-xl animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-slate-400">{label}</div>
          <div className="mt-2 flex items-end gap-1.5">
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="pb-0.5 text-xs text-slate-500">{sub}</div>
          </div>
        </div>

        <div
          className={
            'flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ' +
            gradient
          }
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {typeof progressPercent === 'number' ? (
        <div className="mt-4">
          <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
            <div
              className={'h-1.5 rounded-full bg-gradient-to-r transition-all duration-700 ' + gradient}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-500">อัปเดตล่าสุด: วันนี้</div>
        </div>
      ) : null}
    </div>
  )
}
