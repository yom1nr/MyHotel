import type { ReactNode } from 'react'

type Props = {
    children: ReactNode
    className?: string
    hover?: boolean
    glow?: 'indigo' | 'cyan' | 'emerald' | 'amber' | null
}

const glowCls = {
    indigo: 'glow-indigo',
    cyan: 'glow-cyan',
    emerald: 'glow-emerald',
    amber: 'glow-amber',
}

export default function Card({
    children,
    className = '',
    hover = false,
    glow = null,
}: Props) {
    return (
        <div
            className={
                'glass-card p-5 ' +
                (hover ? 'glass-hover ' : '') +
                (glow ? glowCls[glow] + ' ' : '') +
                className
            }
        >
            {children}
        </div>
    )
}
