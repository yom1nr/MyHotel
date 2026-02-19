import type { InputHTMLAttributes, ReactNode } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
    label?: string
    icon?: ReactNode
    error?: string
}

export default function Input({
    label,
    icon,
    error,
    className = '',
    id,
    ...rest
}: Props) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
        <div>
            {label ? (
                <label htmlFor={inputId} className="mb-2 block text-xs font-medium text-slate-400">
                    {label}
                </label>
            ) : null}
            <div className="relative">
                {icon ? (
                    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                        {icon}
                    </div>
                ) : null}
                <input
                    id={inputId}
                    className={
                        'w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 ' +
                        (icon ? 'pl-10 ' : '') +
                        (error ? 'border-rose-500/50 ring-1 ring-rose-500/20 ' : '') +
                        className
                    }
                    {...rest}
                />
            </div>
            {error ? (
                <p className="mt-1.5 text-xs text-rose-400">{error}</p>
            ) : null}
        </div>
    )
}
