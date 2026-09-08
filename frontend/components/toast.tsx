'use client'

import { useEffect, useState } from 'react'

type Toast = { id: number; text: string }

let pushToast: ((text: string) => void) | null = null

export function toast(text: string) {
  pushToast?.(text)
}

export function ToastHost() {
  const [items, setItems] = useState<Toast[]>([])

  useEffect(() => {
    pushToast = (text) => {
      const id = Date.now()
      setItems((prev) => [...prev, { id, text }])
      setTimeout(() => setItems((prev) => prev.filter((item) => item.id !== id)), 2800)
    }
    return () => {
      pushToast = null
    }
  }, [])

  return (
    <div className="toast-host" aria-live="polite">
      {items.map((item) => (
        <div className="toast" key={item.id}>
          {item.text}
        </div>
      ))}
    </div>
  )
}
