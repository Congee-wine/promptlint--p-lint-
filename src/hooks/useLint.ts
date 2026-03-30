import { useState } from 'react'
import { lintPrompt } from '@/services/lintService'
import type { LintResult } from '@/types'

export function useLint(editorRef: any, monacoRef: any) {
  const [lintResults, setLintResults] = useState<LintResult[]>([])

  const runLint = async (val: string) => {
    const results = await lintPrompt(val)
    setLintResults(results)

    if (monacoRef.current && editorRef.current) {
      const markers = results.map((res) => ({
        severity:
          res.severity === 'error'
            ? monacoRef.current.MarkerSeverity.Error
            : res.severity === 'warning'
              ? monacoRef.current.MarkerSeverity.Warning
              : monacoRef.current.MarkerSeverity.Info,

        message: res.message,
        startLineNumber: res.startLineNumber,
        startColumn: res.startColumn,
        endLineNumber: res.endLineNumber,
        endColumn: res.endColumn,
      }))

      monacoRef.current.editor.setModelMarkers(
        editorRef.current.getModel(),
        'linter',
        markers,
      )
    }
  }

  return {
    lintResults,
    runLint,
  }
}
