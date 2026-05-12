import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showWordmark?: boolean
}

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="relative grid h-9 w-9 place-items-center rounded-xl brand-gradient shadow-soft">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-white"
          aria-hidden
        >
          <path
            d="M3 7.5C3 6.12 4.12 5 5.5 5h9C15.88 5 17 6.12 17 7.5v9C17 17.88 15.88 19 14.5 19h-9C4.12 19 3 17.88 3 16.5v-9Z"
            fill="currentColor"
            fillOpacity="0.95"
          />
          <path
            d="M21 8.31a.7.7 0 0 0-1.06-.6L17 9.55v4.9l2.94 1.84a.7.7 0 0 0 1.06-.6V8.31Z"
            fill="currentColor"
            fillOpacity="0.95"
          />
        </svg>
      </div>
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="text-base font-semibold tracking-tight text-slate-900">
            Universal Webinar
          </span>
        </div>
      )}
    </div>
  )
}
