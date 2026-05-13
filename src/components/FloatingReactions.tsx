import { useEffect, useState } from 'react'

interface FloatingItem {
  id: string
  emoji: string
  left: number
  duration: number
}

const MAX_VISIBLE = 24

export interface FloatingReactionsHandle {
  spawn: (emoji: string) => void
}

interface Props {
  registerHandle: (handle: FloatingReactionsHandle) => void
}

export function FloatingReactions({ registerHandle }: Props) {
  const [items, setItems] = useState<FloatingItem[]>([])

  useEffect(() => {
    registerHandle({
      spawn: (emoji: string) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const left = 30 + Math.random() * 40 // 30%–70% horizontal range
        const duration = 2.2 + Math.random() * 0.8 // 2.2s–3s
        setItems((prev) => {
          const next = [...prev, { id, emoji, left, duration }]
          return next.length > MAX_VISIBLE ? next.slice(-MAX_VISIBLE) : next
        })
        setTimeout(() => {
          setItems((prev) => prev.filter((it) => it.id !== id))
        }, duration * 1000)
      },
    })
  }, [registerHandle])

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {items.map((item) => (
        <span
          key={item.id}
          className="absolute bottom-0 text-3xl"
          style={{
            left: `${item.left}%`,
            animation: `float-up ${item.duration}s ease-out forwards`,
          }}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  )
}
