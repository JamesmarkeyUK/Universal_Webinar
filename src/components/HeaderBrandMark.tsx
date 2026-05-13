// Decorative UNISIM mark, centered inside its parent. Drop this into a
// `relative` container (the nav cluster on the right of a header) and the mark
// embosses behind whichever buttons live there.
export function HeaderBrandMark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
    >
      <img
        src="/unisim-mark.png"
        alt=""
        draggable={false}
        className="h-36 w-36 -rotate-[10deg] select-none opacity-[0.08] sm:h-40 sm:w-40"
      />
    </div>
  )
}
