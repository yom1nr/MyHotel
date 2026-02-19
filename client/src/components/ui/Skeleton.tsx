type Props = {
    className?: string
    width?: string
    height?: string
}

export default function Skeleton({
    className = '',
    width = 'w-full',
    height = 'h-4',
}: Props) {
    return (
        <div
            className={
                'animate-shimmer rounded-lg bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] bg-[length:200%_100%] ' +
                width +
                ' ' +
                height +
                ' ' +
                className
            }
        />
    )
}
