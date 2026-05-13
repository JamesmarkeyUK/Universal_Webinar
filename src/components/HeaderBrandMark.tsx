// Decorative UNISIM mark, centered inside its parent. Drop this into a
// `relative` container and the mark embosses behind whichever children sit
// inside it.
//
// `compact` (≈64px) fits cleanly inside the 64px header chrome — use it when
// the parent is just a small nav cluster (the Admin button or the Sign-out
// group) so the icon doesn't get clipped down to a strip.
//
// Default (`wide`, ≈112px) suits the wider footer text line where the
// surrounding chrome has more room to absorb the size.
interface Props {
  variant?: 'compact' | 'wide'
}

export function HeaderBrandMark({ variant = 'wide' }: Props = {}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
    >
      {variant === 'compact' ? (
        <img
          src="/unisim-mark.png"
          alt=""
          draggable={false}
          className="h-16 w-16 rotate-[12deg] select-none opacity-[0.12]"
        />
      ) : (
        <img
          src="/unisim-mark.png"
          alt=""
          draggable={false}
          className="h-28 w-28 rotate-[12deg] select-none opacity-[0.10]"
        />
      )}
    </div>
  )
}
