import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'

interface ToastProps {
  message: string
  visible: boolean
}

export default function Toast({ message, visible }: ToastProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      setShow(true)
    } else {
      // 延迟隐藏，等动画跑完
      const timer = setTimeout(() => setShow(false), 300)
      return () => clearTimeout(timer)
    }
  }, [visible])

  if (!show) return null

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2
        flex items-center gap-2
        px-4 py-2 rounded-lg
        bg-white/10 backdrop-blur-sm border border-white/20
        text-white/80 text-sm font-mono
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      <Check className="w-4 h-4 text-green-400" />
      {message}
    </div>
  )
}
