import { LintRule } from '@/types'

/**
 * 判断一行是否为"章节标题"
 * 覆盖以下常见格式：
 *   Markdown:   # Title  ## Title  ### Title
 *   加粗:       **Title**  *Title*
 *   中文编号:   一、二、三、  1. 2. 3.  （一）（二）
 *   括号/书名号: 【角色】  [Role]  《任务》
 *   符号前缀:   ▶ ✅ ❌ → ► 等 emoji/箭头开头
 *   分隔线式:   === Title ===  --- Title ---
 *   裸关键词:   Role:  Task:  Context: 等（行首或冒号结尾）
 *   全大写短行: ROLE  TASK（≤30字符的全大写行）
 */
function isHeading(line: string): boolean {
  const t = line.trim()
  if (!t) return false

  // Markdown 标题
  if (/^#{1,6}\s+\S/.test(t)) return true
  // 加粗/斜体包裹的标题行（整行都是加粗）
  if (/^(\*{1,2}|_{1,2}).+(\*{1,2}|_{1,2})\s*$/.test(t)) return true
  // 中文数字编号：一、二、（一）（二）
  if (/^[一二三四五六七八九十百]+[、．.]/.test(t)) return true
  // 阿拉伯数字编号（短行，≤40字符，避免把正文列表误判）
  if (/^\d+[\.、]\s*.{1,30}$/.test(t) && !/[，。？！]/.test(t)) return true
  // 括号/书名号包裹
  if (/^[【\[《「『]/.test(t)) return true
  // emoji / 特殊符号前缀（▶ ✅ ❌ → ► ◆ ● ★ 等）
  if (/^[\u2600-\u27BF\u{1F300}-\u{1F9FF}▶►◆●★→⇒✅❌⚠️]/u.test(t)) return true
  // 分隔线式标题：=== xxx === 或 --- xxx ---
  if (/^[=\-]{2,}\s*.+\s*[=\-]{2,}$/.test(t)) return true
  // 裸关键词冒号（行首，冒号后无大量内容，说明是标题而非正文句子）
  if (/^[A-Za-z\u4e00-\u9fa5]{1,20}\s*[：:]\s*.{0,30}$/.test(t)) return true
  // 全大写短行（英文标题惯例）
  if (/^[A-Z][A-Z\s]{2,28}$/.test(t)) return true

  return false
}

// 提取所有章节：{ heading, startLine, content }
function parseSections(lines: string[]) {
  const sections: { heading: string; startLine: number; content: string }[] = []
  let current: { heading: string; startLine: number; lines: string[] } | null =
    null

  lines.forEach((line, i) => {
    if (isHeading(line)) {
      if (current) {
        sections.push({
          heading: current.heading,
          startLine: current.startLine,
          content: current.lines.join('\n'),
        })
      }
      current = { heading: line.trim(), startLine: i + 1, lines: [] }
    } else if (current) {
      current.lines.push(line)
    }
  })
  if (current) {
    sections.push({
      heading: current.heading,
      startLine: current.startLine,
      content: current.lines.join('\n'),
    })
  }
  return sections
}

// ─── 工具函数：返回第 1 行的 match（文档级缺失提示用） ───────────────────────
function docMatch(lines: string[]) {
  return [
    {
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: lines[0]?.length + 1 || 1,
    },
  ]
}

export const STATIC_RULES: LintRule[] = [
  // ══════════════════════════════════════════════════════
  // ERROR 级别：角色、指令、期望 —— 缺少则 prompt 质量严重受损
  // ══════════════════════════════════════════════════════

  /**
   * 角色（Role）：指定 AI 的专业身份
   * 关键词：Role / 角色 / 你是 / 作为 / As a / You are
   */
  {
    id: 'missing-role',
    severity: 'error',
    category: 'structure',
    message: '未定义角色：缺少对 AI 身份的描述。',
    suggest:
      '在开头添加角色定义，例如 "# Role: 资深前端架构师" 或 "你是一位..."，帮助 AI 锁定专业视角。',
    scope: 'document',
    check: (content, lines) => {
      // 宽松匹配：只要有"身份赋予"的意图即可，不限定具体职业词汇
      if (/Role\s*:/i.test(content)) return []
      if (/(角色|身份|人设)\s*[：:是为]/.test(content)) return []
      if (/你(是|将是|需要是|要作为|扮演)/.test(content)) return []
      if (
        /作为(一个|一位|我的|你的|专属|一名)?[\u4e00-\u9fa5a-zA-Z]/.test(
          content,
        )
      )
        return []
      if (/扮演/.test(content)) return []
      if (/\b(You\s+are|As\s+an?\b|Act\s+as|Your\s+role)\b/i.test(content))
        return []
      return docMatch(lines)
    },
  },

  /**
   * 任务指令：明确告诉 AI 要完成的具体任务
   * 关键词：Task / Goal / Objective / Instruction / 任务 / 请 / 帮我
   */
  {
    id: 'missing-instruction',
    severity: 'error',
    category: 'structure',
    message: '未找到明确指令：缺少具体任务描述。',
    suggest: '添加对 AI 的任务要求，用动词开头明确说明要 AI 做什么。',
    scope: 'document',
    check: (content, lines) => {
      // 有明确段落标记
      if (/\b(Task|Goal|Objective|Instruction)\s*:/i.test(content)) return []
      // 祈使句：请/帮/需要 + 动作词
      if (
        /[请帮需](你|我|AI|模型)?.*?(生成|写|分析|总结|翻译|优化|设计|实现|创建|列出|回答|解释|检查|修复|重构|输出|完成|处理|评估|推荐)/.test(
          content,
        )
      )
        return []
      // 行首动词祈使句
      if (
        /^(生成|写|分析|总结|翻译|优化|设计|实现|创建|列出|回答|解释|检查|修复|重构|输出|完成|处理|评估|推荐)/m.test(
          content,
        )
      )
        return []
      // 英文祈使句
      if (
        /\b(Write|Generate|Create|Analyze|Summarize|Translate|Optimize|Design|Implement|List|Explain|Review|Fix|Refactor)\b/i.test(
          content,
        )
      )
        return []
      // 规则式指令：用"必须/只/按顺序/禁止"规定 AI 行为，本身就是在派发任务
      if (
        /(必须|只(讲|说|输出|回答|推荐|给)|按(以下|固定|顺序)|单次只|严格按|绝对禁止|不得|不能)/.test(
          content,
        )
      )
        return []
      // 流程式指令：节点/步骤/流程 + 顺序词
      if (
        /(节点\d|步骤\d|第\d+(步|节|阶段)|按.*顺序|依次|逐步|一步步)/.test(
          content,
        )
      )
        return []
      return docMatch(lines)
    },
  },

  /**
   * 期望（Expectation）：明确质量标准、特殊要求或性能目标
   * 关键词：Expectation / AC / 验收 / 要求 / 标准 / 需要满足 / 确保
   */
  {
    id: 'missing-expectation',
    severity: 'error',
    category: 'structure',
    message: '未定义期望（Expectation）：缺少质量标准或验收条件。',
    suggest:
      '添加 "# Expectation:" 或 "# AC:" 段落，说明输出需满足的质量标准，例如字数限制、准确性要求等。',
    scope: 'document',
    check: (content, lines) => {
      // 明确段落标记
      if (/\b(Expectation\s*:|AC\s*:)/i.test(content)) return []
      // 中文质量约束表达
      if (
        /(验收|期望|质量标准|需要满足|必须满足|要求.*?(准确|完整|简洁|清晰))/.test(
          content,
        )
      )
        return []
      // 量化约束（字数、条数、格式限制）
      if (/(不超过|至少|最多|最少|≤|≥|单次|每次|每个).*?\d+/.test(content))
        return []
      if (/\d+(字|词|行|条|个|秒|ms)/.test(content)) return []
      // 禁止/必须类约束（也是期望的一种表达）
      if (/(绝对禁止|严禁|必须|不得|不能|禁止)/.test(content)) return []
      // 英文
      if (
        /\b(must|should|ensure|require|no\s+more\s+than|at\s+least|maximum|minimum)\b/i.test(
          content,
        )
      )
        return []
      return docMatch(lines)
    },
  },

  // ══════════════════════════════════════════════════════
  // WARNING 级别：上下文、输出格式 —— 缺少会降低输出质量
  // ══════════════════════════════════════════════════════

  /**
   * 上下文（Context）：提供背景信息、技术栈、现状等关键前提
   * 关键词：Context / Background / 背景 / 当前 / 现状 / 技术栈
   */
  {
    id: 'missing-context',
    severity: 'warning',
    category: 'completeness',
    message: '未提供上下文（Context）：缺少背景信息或技术前提。',
    suggest:
      '添加 "# Context:" 段落，说明项目背景、技术栈或当前状态，帮助 AI 给出更贴合实际的回答。',
    scope: 'document',
    check: (content, lines) => {
      // 明确段落标记
      if (/\b(Context\s*:|Background\s*:)/i.test(content)) return []
      // 中文背景描述
      if (
        /(背景\s*[：:]|当前(项目|系统|环境|版本|阶段)|技术栈|现有(代码|系统|项目)|目前(使用|采用|基于))/.test(
          content,
        )
      )
        return []
      // 学习/使用场景描述（如"零基础"、"入门"也是上下文）
      if (
        /(零基础|初学者|入门|学习路径|学习阶段|我(正在|目前|现在)(学|用|做))/.test(
          content,
        )
      )
        return []
      // 英文
      if (
        /\b(currently|existing|our\s+(project|system|stack)|tech\s+stack|background)\b/i.test(
          content,
        )
      )
        return []
      return docMatch(lines)
    },
  },

  /**
   * 输出格式：定义结果呈现形式
   * 关键词：Format / Output Format / 输出格式 / JSON / Markdown / 列表 / 表格
   */
  {
    id: 'missing-output-format',
    severity: 'info',
    category: 'completeness',
    message: '未指定输出格式（Format）：AI 可能以任意形式返回结果。',
    suggest:
      '添加 "# Format:" 段落，说明期望的输出格式，例如 JSON、Markdown、表格、列表等。',
    scope: 'document',
    check: (content, lines) => {
      if (
        /\b(Output\s*Format|Format\s*:|输出格式|以.*?格式|用.*?格式|返回.*?格式|JSON|Markdown|XML|列表|表格|纯文本|代码块)/i.test(
          content,
        )
      )
        return []
      return docMatch(lines)
    },
  },

  // ══════════════════════════════════════════════════════
  // INFO 级别：输入数据 —— 提供参考数据可提升输出精准度
  // ══════════════════════════════════════════════════════

  /**
   * 输入数据（Input）：给出必要的参考数据、样例或链接
   * 关键词：Input / Example / 示例 / 样例 / 参考 / 数据 / 如下 / 以下
   */
  {
    id: 'missing-input-data',
    severity: 'info',
    category: 'completeness',
    message: '未提供输入数据（Input）：没有示例或参考数据。',
    suggest:
      '添加输入数据段落，提供样例数据、参考链接或具体输入，帮助 AI 更精准地理解需求。',
    scope: 'document',
    check: (content, lines) => {
      if (
        /\b(Input\s*:|Example\s*:|示例\s*:|样例\s*:|参考数据|如下[：:]|以下[是为]|```)/i.test(
          content,
        )
      )
        return []
      return docMatch(lines)
    },
  },

  // ══════════════════════════════════════════════════════
  // 其他质量规则
  // ══════════════════════════════════════════════════════

  {
    id: 'empty-section',
    severity: 'error',
    category: 'completeness',
    message: '章节标题下没有实质内容。',
    suggest: '在标题下方补充具体内容，避免留空。',
    scope: 'document',
    check: (_content, lines) => {
      const matches = []
      const sections = parseSections(lines)

      // 获取标题的层级深度（# 数量，或非 Markdown 标题统一视为 1）
      function headingDepth(heading: string): number {
        const m = heading.match(/^(#{1,6})\s/)
        return m ? m[1].length : 1
      }

      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i]
        if (sec.content.trim().length === 0) {
          // 如果下一个章节层级更深，说明当前是父标题，内容在子章节里，不报错
          const next = sections[i + 1]
          if (next && headingDepth(next.heading) > headingDepth(sec.heading)) {
            continue
          }
          matches.push({
            startLineNumber: sec.startLine,
            startColumn: 1,
            endLineNumber: sec.startLine,
            endColumn: lines[sec.startLine - 1]?.length + 1 || 1,
          })
        }
      }
      return matches
    },
  },

  {
    id: 'missing-constraints',
    severity: 'warning',
    category: 'completeness',
    message: '未找到约束条件',
    suggest: '添加约束限制，说明禁止事项或边界条件，避免 AI 输出超出预期范围。',
    scope: 'document',
    check: (content, lines) => {
      // 英文用 \b 单词边界，中文单独匹配（\b 对中文无效）
      if (/\b(Constraints?|Rules?|Limitations?)\b/i.test(content)) return []
      if (/(禁止|不得|不能|限制|必须)/.test(content)) return []
      return docMatch(lines)
    },
  },

  {
    id: 'no-quantifier',
    severity: 'warning',
    category: 'clarity',
    message: '全文未找到任何量化指标，prompt 的期望过于模糊。',
    suggest:
      '至少加入一处量化描述，例如字数限制（"不超过200字"）、数量限制（"≤3个"）、格式要求（"返回JSON"）或时间要求（"100ms内"）。',
    scope: 'document',
    check: (content, lines) => {
      // 数字 + 单位（中文单位）
      if (
        /\d+\s*(字|词|行|条|个|秒|分钟|小时|ms|kb|mb|次|步|节点|模块)/.test(
          content,
        )
      )
        return []
      // 数字 + 百分比
      if (/\d+\s*%/.test(content)) return []
      // 不超过 / 至少 / 最多 / 最少 + 数字
      if (
        /(不超过|至少|最多|最少|超过|小于|大于|≤|≥|<=|>=)\s*\d+/.test(content)
      )
        return []
      // ≤ / ≥ 符号直接跟数字
      if (/[≤≥]\s*\d+/.test(content)) return []
      // 英文量化：no more than / at least / up to + 数字
      if (
        /\b(no\s+more\s+than|at\s+least|up\s+to|less\s+than|greater\s+than|maximum|minimum)\s+\d+/i.test(
          content,
        )
      )
        return []
      // 格式类量化（明确指定输出格式也算一种量化约束）
      if (/\b(JSON|XML|CSV|Markdown|YAML)\b/i.test(content)) return []

      return docMatch(lines)
    },
  },

  {
    id: 'vague-task-description',
    severity: 'warning',
    category: 'clarity',
    message: '任务描述过于简短，可能不够清晰。',
    suggest: '补充更多上下文，说明背景、目标受众或具体要求。',
    scope: 'document',
    check: (_content, lines) => {
      const sections = parseSections(lines)
      const taskSection = sections.find((s) =>
        /\b(Task|Goal|Objective|Instruction)\s*:/i.test(s.heading),
      )
      if (!taskSection) return []
      if (taskSection.content.replace(/\s/g, '').length >= 15) return []
      const lineIdx = taskSection.startLine
      return [
        {
          startLineNumber: lineIdx,
          startColumn: 1,
          endLineNumber: lineIdx,
          endColumn: lines[lineIdx - 1]?.length + 1 || 1,
        },
      ]
    },
  },
]
