// Decorative UNISIM mark, centered inside its parent. Drop this into a
// `relative` container (the nav cluster on the right of a header) and the mark
// embosses behind whichever buttons live there. Sized so the rotated icon
// fits inside a 64px header — the parent header sets overflow-hidden to clip
// anything that does still poke beyond the nav line.
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
        className="h-28 w-28 rotate-[12deg] select-none opacity-[0.10]"
      />
    </div>
  )
}
