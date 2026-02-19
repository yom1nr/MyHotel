import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
type Size = 'sm' | 'md' | 'lg'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant
    size?: Size
    loading?: boolean
    icon?: ReactNode
}

const variantCls: Record<Variant, string> = {
    primary:
        'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-indigo-400 active:from-indigo-700 active:to-indigo-600',
    secondary:
        'bg-white/[0.06] text-slate-300 ring-1 ring-white/[0.1] hover:bg-white/[0.1] hover:text-white',
    danger:
        'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-500/20 hover:from-rose-500 hover:to-rose-400',
    ghost:
        'text-slate-400 hover:bg-white/[0.06] hover:text-white',
    success:
        'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-emerald-400',
}

const sizeCls: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-sm gap-2',
}

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    className = '',
    disabled,
    ...rest
}: Props) {
    return (
        <button
            className={
                'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none ' +
                variantCls[variant] +
                ' ' +
                sizeCls[size] +
                ' ' +
                className
            }
            disabled={disabled || loading}
            {...rest}
        >
            {loading ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
            ) : icon ? (
                icon
            ) : null}
            {children}
        </button>
    )
}
