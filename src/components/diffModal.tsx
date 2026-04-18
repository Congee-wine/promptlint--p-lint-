import { DiffEditor } from '@monaco-editor/react'
import { X, Check, XCircle } from 'lucide-react'

interface DiffModalProps {
  // original 和 modified 不为 null 时弹窗显示
  original: string
  modified: string
  onAccept: () => void // 用户点"接受重构"
  onReject: () => void // 用户点"取消"
}

export default function DiffModal({
  original,
  modified,
  onAccept,
  onReject,
}: DiffModalProps) {
  return (
    // 遮罩层：点击遮罩也可以关闭
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        // 只有点击遮罩本身才关闭，点击弹窗内部不关闭
        if (e.target === e.currentTarget) onReject()
      }}
    >
      {/* 弹窗主体 */}
      <div className="w-[90vw] h-[80vh] bg-[#1e1e1e] rounded-xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
        {/* 顶部标题栏 */}
        <div className="h-12 flex items-center justify-between px-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-white/90">
              重构对比
            </span>
            {/* 左右标签说明 */}
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20">
                原始
              </span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-green-500/15 text-green-400 border border-green-500/20">
                重构后
              </span>
            </div>
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={onReject}
            className="text-white/40 hover:text-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Monaco Diff Editor 区域 */}
        <div className="flex-1 overflow-hidden">
          <DiffEditor
            original={original}
            modified={modified}
            language="markdown"
            theme="vs-dark"
            options={{
              readOnly: true, // 对比视图只读，不允许在这里编辑
              renderSideBySide: true, // true = 左右并排；false = 内联模式
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              diffWordWrap: 'on', // 按单词级别对比，更细粒度
            }}
          />
        </div>

        {/* 底部操作栏 */}
        <div className="h-14 flex items-center justify-end gap-3 px-5 border-t border-white/10 shrink-0">
          <button
            onClick={onReject}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white/90 hover:bg-white/5 transition-all border border-white/10"
          >
            <XCircle className="w-4 h-4" />
            取消
          </button>
          <button
            onClick={onAccept}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all font-medium"
          >
            <Check className="w-4 h-4" />
            接受重构
          </button>
        </div>
      </div>
    </div>
  )
}
