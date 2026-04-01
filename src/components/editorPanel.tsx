import { useState, useRef } from 'react'
import { editorOptions } from '@/utils/editorOptions'
import Editor, { OnMount } from '@monaco-editor/react'
import { ChevronRight, History, Copy, Upload, Download } from 'lucide-react'
import { useHistory } from '@/hooks'

import HistoryPanel from './historyPanel'
import SymbolIcon from './symbolIcon'
import Toast from './toast'

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
  const timerRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const {
    records,
    activeId,
    importRecord,
    updateActiveRecord,
    deleteRecord,
    setActiveId,
  } = useHistory()

  const handleCopy = async () => {
    if (copied) return

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    await navigator.clipboard.writeText(content)
    setCopied(true)

    timerRef.current = setTimeout(() => {
      setCopied(false)
      timerRef.current = null
    }, 2000)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.txt'

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        onChange(text)
        importRecord(text, file.name)
      }
      reader.readAsText(file)
    }

    input.click()
  }

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
    <div className="flex-1 flex flex-col relative">
      {/* 顶部工具栏 */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a]">
        <div className="flex items-center gap-2 text-sm text-white/50 font-mono">
          <span>Editor</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white/80">prompt.md</span>
        </div>

        <div className="flex items-center">
          <div className="text-xs text-white/30 font-mono mr-4">
            {content.length} characters | {content.split('\n').length} lines
          </div>

          <SymbolIcon title={copied ? '已复制' : '复制'} onEvent={handleCopy}>
            <Copy className="w-4 h-4" />
          </SymbolIcon>

          <SymbolIcon
            title="历史记录"
            onEvent={() => setHistoryOpen(!historyOpen)}
          >
            <History className="w-4 h-4" />
          </SymbolIcon>

          <SymbolIcon title="导入" onEvent={handleImport}>
            <Upload className="w-4 h-4" />
          </SymbolIcon>

          <SymbolIcon title="导出" onEvent={handleExport}>
            <Download className="w-4 h-4" />
          </SymbolIcon>
        </div>
      </div>

      {/* 编辑器 */}
      <div className="flex-1">
        <Editor
          height="96%"
          defaultLanguage="markdown"
          theme="vs-dark"
          value={content}
          onChange={(val) => {
            const text = val || ''
            onChange(text)
            updateActiveRecord(text)
          }}
          onMount={onMount}
          options={editorOptions as any}
        />
      </div>

      <Toast message="已复制到剪贴板" visible={copied} />

      <HistoryPanel
        open={historyOpen}
        records={records}
        activeId={activeId}
        onSelect={(c, id) => {
          onChange(c)
          setActiveId(id)
          setHistoryOpen(false)
        }}
        onDelete={deleteRecord}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  )
}
