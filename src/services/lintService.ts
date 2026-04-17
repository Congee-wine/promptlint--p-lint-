import { STATIC_RULES } from '@/rules'
import { type LintResult } from '@/types'
import { aiClient, AI_MODEL } from './aiProvider'

// 1. 静态扫描（纯本地，不调用 AI）
export async function lintPrompt(content: string): Promise<LintResult[]> {
  const lines = content.split('\n')

  return STATIC_RULES.flatMap((rule) =>
    rule.check(content, lines).map((match) => ({
      ruleId: rule.id,
      severity: rule.severity,
      category: rule.category,
      message: rule.message,
      suggest: rule.suggest,
      ...match,
    })),
  )
}

// 2. 深度分析（调用 AI）
export async function deepAnalyzePrompt(content: string) {
  if (!content.trim()) return null

  try {
    const response = await aiClient.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            '你是一个 Prompt 质量评审专家，擅长从结构完整性、表达清晰度、可执行性三个维度对 AI 提示词进行深度分析。',
        },
        {
          role: 'user',
          content: `请对以下 Prompt 进行深度质量分析。

## 评审框架

一个高质量的 Prompt 应包含以下六个黄金结构，请逐一评估：
1. 角色（Role）：是否明确指定了 AI 的专业身份或人设
2. 指令（Instruction）：是否用动词清晰说明了要 AI 完成的具体任务
3. 期望（Expectation）：是否定义了质量标准、验收条件或约束规则
4. 上下文（Context）：是否提供了背景信息、使用场景或技术前提
5. 输出格式（Format）：是否指定了输出的呈现形式（如 JSON、列表、Markdown 等）
6. 输入数据（Input）：是否提供了示例数据、参考内容或具体输入

## 待分析的 Prompt

"""
${content}
"""

## 输出要求

以 JSON 格式返回，包含以下字段：
- score: 综合质量评分（0-100），基于六个结构的完整度和表达质量综合评定
- missingStructures: 缺失或薄弱的结构名称列表（string[]），只列出真正缺失或明显不足的
- logicalConflicts: 逻辑冲突或自相矛盾的问题列表（string[]），没有则返回空数组
- suggestions: 具体可操作的改进建议列表（string[]），每条建议说明改什么、怎么改
- structureAnalysis: 对六个结构完整性的总体评价（string，100字以内）

只返回 JSON，不要包含任何 Markdown 代码块或其他文字。`,
        },
      ],
    })

    const text = response.choices[0].message.content || ''
    return JSON.parse(text)
  } catch (error) {
    console.error('Deep analysis failed:', error)
    return null
  }
}

// 3. 一键重构（调用 AI）
export async function autoFixPrompt(content: string) {
  try {
    const response = await aiClient.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            '你是一个 Prompt 重构专家，擅长将零散、模糊的提示词改写为结构清晰、要素完整的高质量 Prompt。重构时保留原始意图，不改变核心需求。',
        },
        {
          role: 'user',
          content: `请将以下原始 Prompt 重构为结构化的高质量版本。

## 重构标准

重构后的 Prompt 必须包含以下六个结构（用 Markdown 二级标题分隔）：
- **## Role（角色）**：明确 AI 的专业身份，例如"你是一位资深前端工程师"
- **## Context（上下文）**：说明背景信息、使用场景或技术前提
- **## Instruction（指令）**：用动词开头，清晰说明要 AI 完成的具体任务
- **## Format（输出格式）**：指定输出的呈现形式，例如 Markdown、JSON、列表等
- **## Expectation（期望）**：定义质量标准和验收条件，至少包含 1 个量化指标
- **## Constraints（约束）**：列出禁止事项和边界条件

## 原始 Prompt

"""
${content}
"""

## 要求

- 保留原始 Prompt 的核心意图，不要改变用户真正想要的东西
- 缺失的结构根据上下文合理补充，不要凭空捏造与原意无关的内容
- 语言风格与原始 Prompt 保持一致（中文用中文，英文用英文）
- 提示词格式原始 Prompt 保持一致，不要添加 Markdown 标题或其他格式
- 直接返回重构后的 Markdown 内容，不要加任何解释或前言`,
        },
      ],
    })

    return response.choices[0].message.content || content
  } catch (error) {
    console.error('Auto fix failed:', error)
    return content
  }
}
