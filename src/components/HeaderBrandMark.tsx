// Decorative UNISIM mark, centered inside its parent. Drop this into a
// `relative` container (the nav cluster on the right of a header) and the mark
// embosses behind whichever buttons live there. Sized to sit inside a 64px
// header without clipping.
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
        className="h-28 w-28 -rotate-[18deg] select-none opacity-[0.12]"
      />
    </div>
  )
}
