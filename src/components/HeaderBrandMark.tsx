// Decorative UNISIM mark rendered behind navigation content. Lightly tilted
// and faded so it reads as a watermark rather than a logo.
export function HeaderBrandMark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 z-0 flex items-center overflow-hidden"
    >
      <img
        src="/unisim-mark.png"
        alt=""
        draggable={false}
        className="h-36 w-36 -rotate-[10deg] translate-x-8 select-none opacity-[0.07] sm:h-40 sm:w-40 sm:translate-x-6"
      />
    </div>
  )
}
