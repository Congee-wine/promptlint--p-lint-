export interface LintRule {
  id: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  triggers?: string[];
  conflictsWith?: string[];
  category: 'vague' | 'structure' | 'logic';
}

export interface LintResult {
  ruleId: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

export const VAGUE_WORDS = [
  '极速', '快速', '批量', '丝滑', '高性能', '低延迟', '稳定', '可靠', '智能', '强大',
  '简单', '易用', '友好', '极致', '完美', '优秀', '高效', '灵活', '全面', '深度',
  '瞬时', '无缝', '顶级', '领先', '专业', '卓越', '精简', '丰富', '海量', '超强',
  'fast', 'quick', 'smooth', 'high performance', 'low latency', 'stable', 'reliable',
  'smart', 'powerful', 'simple', 'easy', 'friendly', 'perfect', 'excellent', 'efficient',
  'instant', 'seamless', 'top-tier', 'leading', 'professional', 'outstanding', 'minimal',
  'rich', 'massive', 'super', 'ultra', 'best', 'great', 'good', 'better', 'best-in-class'
];

export const STATIC_RULES: LintRule[] = [
  {
    id: 'vague-adjective',
    severity: 'warning',
    category: 'vague',
    message: '检测到模糊形容词。建议使用具体的量化指标（如：响应时间 < 200ms）。',
  },
  {
    id: 'speed-vs-pressure',
    severity: 'error',
    category: 'logic',
    triggers: ['极速', '快速', '批量', 'fast', 'quick'],
    conflictsWith: ['不压力', '不封号', '不卡顿', 'low pressure', 'no lag'],
    message: '检测到“速度”与“压力控制”的潜在冲突。建议设置并发限制 (Concurrency) 和请求间隔 (Delay)。',
  },
  {
    id: 'missing-role',
    severity: 'warning',
    category: 'structure',
    message: '缺失 Role (角色) 定义。建议添加：# Role: [角色名称]',
  },
  {
    id: 'missing-task',
    severity: 'error',
    category: 'structure',
    message: '缺失 Task (任务) 定义。建议明确：# Task: [具体任务]',
  },
  {
    id: 'missing-ac',
    severity: 'warning',
    category: 'structure',
    message: '缺失 AC (验收标准)。建议添加：# AC: [标准1, 标准2]',
  },
  {
    id: 'missing-format',
    severity: 'info',
    category: 'structure',
    message: '建议明确 Output Format (输出格式)。',
  }
];
