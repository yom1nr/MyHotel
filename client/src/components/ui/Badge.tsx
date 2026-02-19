import type { ReactNode } from 'react'

type Variant = 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'slate' | 'blue'

type Props = {
    variant?: Variant
    children: ReactNode
    className?: string
}

const variantCls: Record<Variant, string> = {
    indigo: 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/25',
    emerald: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/25',
    amber: 'bg-amber-500/15 text-amber-300 ring-amber-500/25',
    rose: 'bg-rose-500/15 text-rose-300 ring-rose-500/25',
    cyan: 'bg-cyan-500/15 text-cyan-300 ring-cyan-500/25',
    slate: 'bg-white/[0.06] text-slate-400 ring-white/[0.1]',
    blue: 'bg-blue-500/15 text-blue-300 ring-blue-500/25',
}

export default function Badge({ variant = 'slate', children, className = '' }: Props) {
    return (
        <span
            className={
                'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ' +
                variantCls[variant] +
                ' ' +
                className
            }
        >
            {children}
        </span>
    )
}
