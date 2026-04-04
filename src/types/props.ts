import { OnMount } from '@monaco-editor/react'
import { HistoryRecord } from '@/hooks/useHistory'
import { type LintResult } from './index'

export interface EditorPanelProps {
  content: string
  onChange: (val: string) => void
  onMount: OnMount
}

export interface HistoryPanelProps {
  open: boolean
  records: HistoryRecord[]
  activeId: string | null
  onSelect: (content: string, id: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export interface SidebarProps {
  score: number
  lintResults: LintResult[]
  analysis: any
  onAnalyze: () => void
  onFix: () => void
  isAnalyzing: boolean
  isFixing: boolean
}

export type SymbolIconProps = {
  title: string
  onEvent: () => void
  children: React.ReactNode
}

export interface ToastProps {
  message: string
  visible: boolean
}
