export default function HotelLogo({ size = 36, className = '' }: { size?: number; className?: string }) {
    return (
        <img
            src="/logo.svg"
            alt="Hotel Brunelleschi"
            width={size}
            height={size}
            className={className}
        />
    )
}
