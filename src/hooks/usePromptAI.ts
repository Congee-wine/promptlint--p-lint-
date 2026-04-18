import { useState } from 'react'
import { deepAnalyzePrompt, autoFixPrompt } from '@/services/lintService'

export function usePromptAI() {
  const [analysis, setAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isFixing, setIsFixing] = useState(false)

  // diff 相关状态
  // diffResult 存放"原始内容"和"重构后内容"，不为 null 时弹窗显示
  const [diffResult, setDiffResult] = useState<{
    original: string
    fixed: string
  } | null>(null)

  const handleDeepAnalyze = async (content: string) => {
    setIsAnalyzing(true)
    try {
      const result = await deepAnalyzePrompt(content)
      setAnalysis(result)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAutoFix = async (
    content: string,
    onFix?: (fixed: string) => void,
  ) => {
    setIsFixing(true)
    try {
      const fixed = await autoFixPrompt(content)
      // 不再直接写入编辑器，而是把原始和重构结果都存起来，等用户在 diff 弹窗里确认
      setDiffResult({ original: content, fixed })
    } finally {
      setIsFixing(false)
    }
  }

  // 用户在 diff 弹窗点"接受" → 执行写入，关闭弹窗
  const acceptFix = (onFix: (fixed: string) => void) => {
    if (diffResult) {
      onFix(diffResult.fixed)
      setDiffResult(null)
    }
  }

  // 用户在 diff 弹窗点"取消" → 直接关闭弹窗，什么都不做
  const rejectFix = () => {
    setDiffResult(null)
  }

  return {
    analysis,
    isAnalyzing,
    isFixing,
    diffResult,
    handleDeepAnalyze,
    handleAutoFix,
    acceptFix,
    rejectFix,
  }
}
