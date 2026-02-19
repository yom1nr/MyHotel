import type { ReactNode } from 'react'

type Props = {
    title: string
    subtitle?: string
    actions?: ReactNode
    className?: string
}

export default function PageHeader({
    title,
    subtitle,
    actions,
    className = '',
}: Props) {
    return (
        <div className={'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ' + className}>
            <div>
                <h1 className="text-lg font-bold text-white">{title}</h1>
                {subtitle ? (
                    <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
                ) : null}
            </div>
            {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
    )
}
