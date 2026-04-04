import { GoogleGenAI } from '@google/genai'
import { STATIC_RULES, VAGUE_WORDS } from '@/rules'
import { type LintResult } from '@/types'

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

export async function lintPrompt(content: string): Promise<LintResult[]> {
  const results: LintResult[] = []
  const lines = content.split('\n')

  // 1. 静态代码检查
  lines.forEach((line, index) => {
    const lineNumber = index + 1

    // 检查模糊用词
    VAGUE_WORDS.forEach((word) => {
      const regex = new RegExp(word, 'gi')
      let match: RegExpExecArray | null
      while ((match = regex.exec(line)) !== null) {
        results.push({
          ruleId: 'vague-adjective',
          severity: 'warning',
          message: `模糊词 "${word}": 建议使用具体的量化指标替换。`,
          startLineNumber: lineNumber,
          startColumn: match.index + 1,
          endLineNumber: lineNumber,
          endColumn: match.index + word.length + 1,
        })
      }
    })

    // 检查速度与压力冲突
    const speedRule = STATIC_RULES.find((r) => r.id === 'speed-vs-pressure')
    const hasSpeed = speedRule?.triggers?.some((t) => line.includes(t))
    const hasPressure = speedRule?.conflictsWith?.some((c) => line.includes(c))

    if (hasSpeed && hasPressure) {
      results.push({
        ruleId: 'speed-vs-pressure',
        severity: 'error',
        message: speedRule.message,
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: line.length + 1,
      })
    }
  })

  // 检查结构完整性
  if (!content.match(/#?\s*Role/i)) {
    results.push({
      ruleId: 'missing-role',
      severity: 'error',
      message: '缺失 Role 定义。',
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: lines[0]?.length + 1 || 1,
    })
  }
  if (!content.match(/#?\s*Task/i)) {
    results.push({
      ruleId: 'missing-task',
      severity: 'error',
      message: '缺失 Task 定义。',
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: lines[0]?.length + 1 || 1,
    })
  }

  return results
}

// 2. 深度分析
export async function deepAnalyzePrompt(content: string) {
  if (!content.trim()) return null

  try {
    const model = 'gemini-3-flash-preview'
    const response = await genAI.models.generateContent({
      model,
      contents: `你是一个 Prompt 专家。请对以下 Prompt 进行逻辑评审和质量分析。
      
      Prompt 内容:
      """
      ${content}
      """
      
      请以 JSON 格式返回分析结果，包含以下字段：
      - score: 0-100 的分数
      - logicalConflicts: 逻辑冲突列表 (string[])
      - suggestions: 改进建议列表 (string[])
      - structureAnalysis: 结构完整性分析 (string)
      
      返回 JSON 格式，不要包含 Markdown 代码块。`,
      config: {
        responseMimeType: 'application/json',
      },
    })

    return JSON.parse(response.text)
  } catch (error) {
    console.error('Deep analysis failed:', error)
    return null
  }
}

// 3. 一键重构
export async function autoFixPrompt(content: string) {
  try {
    const model = 'gemini-3-flash-preview'
    const response = await genAI.models.generateContent({
      model,
      contents: `请将以下 Prompt 重构为结构化的 Markdown 格式（包含 Role, Context, Task, AC, Constraints）。
      如果内容模糊，请根据常识补充合理的验收标准(AC)。
      
      原始内容:
      """
      ${content}
      """
      
      直接返回重构后的 Markdown 内容。`,
    })

    return response.text
  } catch (error) {
    console.error('Auto fix failed:', error)
    return content
  }
}
