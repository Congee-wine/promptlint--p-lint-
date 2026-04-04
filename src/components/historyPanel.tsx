import { X, Trash2, Clock } from 'lucide-react'
import { type HistoryPanelProps } from '@/types'

export default function HistoryPanel({
  open,
  records,
  activeId,
  onSelect,
  onDelete,
  onClose,
}: HistoryPanelProps) {
  if (!open) return null

  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-[#0f0f0f] border-l border-white/10 flex flex-col z-10">
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/10">
        <span className="text-sm font-mono text-white/80 flex items-center gap-2">
          <Clock className="w-4 h-4" /> 历史记录
        </span>
        <button onClick={onClose} className="text-white/40 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {records.length === 0 && (
          <p className="text-white/30 text-sm text-center mt-8">暂无历史记录</p>
        )}
        {records.map((r) => (
          <div
            key={r.id}
            onClick={() => onSelect(r.content, r.id)}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              r.id === activeId
                ? 'border-white/40 bg-white/5'
                : 'border-white/10 hover:border-white/30'
            }`}
          >
            <div className="text-xs text-white/60 font-mono mb-1 truncate">
              {r.filename}
            </div>
            <div className="text-xs text-white/30 mb-1">
              {new Date(r.createdAt).toLocaleString()}
            </div>
            <div className="text-sm text-white/70 line-clamp-3 font-mono leading-relaxed">
              {r.content}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(r.id)
              }}
              className="mt-2 text-white/20 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
