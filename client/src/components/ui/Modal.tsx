import type { ReactNode } from 'react'
import { useEffect } from 'react'

type Props = {
    open: boolean
    onClose: () => void
    title?: string
    subtitle?: string
    children: ReactNode
    maxWidth?: string
}

export default function Modal({
    open,
    onClose,
    title,
    subtitle,
    children,
    maxWidth = 'max-w-2xl',
}: Props) {
    useEffect(() => {
        if (!open) return
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onEsc)
        return () => window.removeEventListener('keydown', onEsc)
    }, [open, onClose])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                className={
                    'relative w-full rounded-2xl border border-white/[0.08] bg-navy-800 p-6 shadow-2xl animate-slide-up ' +
                    maxWidth
                }
            >
                {title ? (
                    <div className="mb-5">
                        <h3 className="text-base font-semibold text-white">{title}</h3>
                        {subtitle ? (
                            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
                        ) : null}
                    </div>
                ) : null}
                {children}
            </div>
        </div>
    )
}
