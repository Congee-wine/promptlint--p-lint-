import { LintResult } from '@/types'

export const calculateScore = (
  results: LintResult[],
  analysisScore?: number,
) => {
  if (analysisScore !== undefined) return analysisScore

  const weights = { error: 10, warning: 6, info: 2 }

  const totalDeduction = results.reduce((sum, r, index) => {
    const decayFactor = 1 / (1 + index * 0.1) // 越后面的错误扣分越少
    return sum + weights[r.severity] * decayFactor
  }, 0)

  return Math.max(0, Math.round(100 - totalDeduction))
}
