import { useState, useEffect, useRef } from 'react'
import { type OnMount } from '@monaco-editor/react'
import Sidebar from '@/components/sidebar'
import EditorPanel from '@/components/editorPanel'
import { useLint, usePromptAI, useHistory } from '@/hooks'
import { calculateScore } from './utils/calculateScore'
import { type LintResult } from '@/types'

export default function App() {
  const { updateActiveRecord, initialContent } = useHistory()

  const [content, setContent] = useState(initialContent)
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  const { runLint, lintResults } = useLint(editorRef, monacoRef)
  const { analysis, isAnalyzing, isFixing, handleDeepAnalyze, handleAutoFix } =
    usePromptAI()

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // 注册跳转高亮样式
    monaco.editor.defineTheme('vs-dark-custom', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {},
    })
    monaco.editor.setTheme('vs-dark-custom')

    // 初始检查
    runLint(content)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      runLint(content)
    }, 500)
    return () => clearTimeout(timer)
  }, [content])

  const score = calculateScore(lintResults, analysis?.score)

  const handleFix = () => {
    handleAutoFix(content, (fixed) => {
      setContent(fixed)
      runLint(fixed)
      updateActiveRecord(fixed)
    })
  }

  const handleNavigateToError = (result: LintResult) => {
    const editor = editorRef.current
    if (!editor) return

    editor.revealLineInCenter(result.startLineNumber)
    editor.setPosition({
      lineNumber: result.startLineNumber,
      column: result.startColumn,
    })
    editor.setSelection({
      startLineNumber: result.startLineNumber,
      startColumn: result.startColumn,
      endLineNumber: result.endLineNumber,
      endColumn: result.endColumn,
    })

    // 加临时高亮 decoration，1.5 秒后自动清除
    const highlightClass =
      result.severity === 'error'
        ? 'navigate-highlight-error'
        : result.severity === 'warning'
          ? 'navigate-highlight-warning'
          : 'navigate-highlight-info'

    const decorations = editor.createDecorationsCollection([
      {
        range: {
          startLineNumber: result.startLineNumber,
          startColumn: result.startColumn,
          endLineNumber: result.endLineNumber,
          endColumn: result.endColumn,
        },
        options: {
          isWholeLine: true,
          className: highlightClass,
        },
      },
    ])

    setTimeout(() => decorations.clear(), 1500)

    editor.focus()
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      <Sidebar
        score={Math.max(0, score)}
        lintResults={lintResults}
        analysis={analysis}
        onAnalyze={() => handleDeepAnalyze(content)}
        onFix={handleFix}
        isAnalyzing={isAnalyzing}
        isFixing={isFixing}
        onNavigateToError={handleNavigateToError}
      />

      {/* 主编辑器区域 */}
      <EditorPanel
        content={content}
        onChange={setContent}
        onMount={handleEditorDidMount}
      />
    </div>
  )
}
