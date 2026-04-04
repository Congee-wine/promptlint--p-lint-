import { useState, useEffect, useRef } from 'react'
import { type OnMount } from '@monaco-editor/react'
import Sidebar from '@/components/sidebar'
import EditorPanel from '@/components/editorPanel'
import { useLint, usePromptAI, useHistory } from '@/hooks'

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

    // 初始检查
    runLint(content)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      runLint(content)
    }, 500)
    return () => clearTimeout(timer)
  }, [content])

  const score = analysis?.score || 100 - lintResults.length * 10

  const handleFix = () => {
    handleAutoFix(content, (fixed) => {
      setContent(fixed)
      runLint(fixed)
      updateActiveRecord(fixed)
    })
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
