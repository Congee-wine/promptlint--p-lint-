import { GoogleGenAI } from '@google/genai'
import { STATIC_RULES } from '@/rules'
import { type LintResult } from '@/types'

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

export async function lintPrompt(content: string): Promise<LintResult[]> {
  const lines = content.split('\n')

  return STATIC_RULES.flatMap((rule) =>
    rule.check(content, lines).map((match) => ({
      ruleId: rule.id,
      severity: rule.severity,
      message: rule.message,
      suggest: rule.suggest,
      ...match,
    })),
  )
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
