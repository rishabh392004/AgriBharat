export function LeafMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden>
      <path
        d="M12 40c8-22 22-28 40-28-2 20-10 34-32 40-4-4-8-8-8-12Z"
        fill="currentColor"
        opacity="0.92"
      />
      <path d="M20 36c8-6 16-10 28-12" stroke="#173d2a" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="46" cy="18" r="5" fill="#e4b23a" />
    </svg>
  )
}
