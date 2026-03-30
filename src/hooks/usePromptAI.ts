import { useState } from 'react'
import { deepAnalyzePrompt, autoFixPrompt } from '@/services/lintService'

interface UsePromptAIResult {
  analysis: any
  isAnalyzing: boolean
  isFixing: boolean
  handleDeepAnalyze: (content: string) => Promise<void>
  handleAutoFix: (
    content: string,
    onFix?: (fixed: string) => void,
  ) => Promise<void>
}

export function usePromptAI(): UsePromptAIResult {
  const [analysis, setAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isFixing, setIsFixing] = useState(false)

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
      if (onFix) onFix(fixed)
    } finally {
      setIsFixing(false)
    }
  }

  return { analysis, isAnalyzing, isFixing, handleDeepAnalyze, handleAutoFix }
}
