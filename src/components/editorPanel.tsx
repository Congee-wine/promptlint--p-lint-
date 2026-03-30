import { editorOptions } from '@/utils/editorOptions'
import Editor, { OnMount } from '@monaco-editor/react'
import { ChevronRight, Download } from 'lucide-react'

interface EditorPanelProps {
  content: string
  onChange: (val: string) => void
  onMount: OnMount
}

export default function EditorPanel({
  content,
  onChange,
  onMount,
}: EditorPanelProps) {
  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prompt.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* 顶部工具栏 */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a]">
        <div className="flex items-center gap-2 text-sm text-white/50 font-mono">
          <span>Editor</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white/80">prompt.md</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs text-white/30 font-mono">
            {content.length} characters | {content.split('\n').length} lines
          </div>

          <button
            onClick={handleExport}
            className="p-2 hover:bg-white/10 rounded-md transition-colors text-white/50 hover:text-white"
            title="Export"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 编辑器 */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="markdown"
          theme="vs-dark"
          value={content}
          onChange={(val) => onChange(val || '')}
          onMount={onMount}
          options={editorOptions as any}
        />
      </div>
    </div>
  )
}
