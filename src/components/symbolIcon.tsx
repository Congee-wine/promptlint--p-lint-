import { type SymbolIconProps } from '@/types'

function SymbolIcon({ title, onEvent, children }: SymbolIconProps) {
  return (
    <button
      onClick={onEvent}
      className="p-2 hover:bg-white/10 rounded-md transition-colors text-white/50 hover:text-white"
      title={title}
    >
      {children}
    </button>
  )
}

export default SymbolIcon
