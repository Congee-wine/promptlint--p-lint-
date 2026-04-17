import OpenAI from 'openai'

// ─── 所有支持的 Provider 配置 ────────────────────────────────────────────────
// 每个 provider 包含三个信息：
//   baseURL  - 该服务的 API 地址
//   model    - 默认使用的模型名
//   label    - 显示用的名称（方便调试时识别）
export const AI_PROVIDERS = {
  longcat: {
    baseURL: 'https://api.longcat.chat/openai/v1',
    model: 'LongCat-Flash-Chat',
    label: 'LongCat Flash Chat',
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    label: 'DeepSeek Chat',
  },
  qwen: {
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-turbo',
    label: '通义千问 Turbo',
  },
  openai: {
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    label: 'OpenAI GPT-4o Mini',
  },
} as const

// ─── 在这里切换模型，改这一行就够了 ──────────────────────────────────────────
export const CURRENT_PROVIDER = 'longcat' as keyof typeof AI_PROVIDERS

// ─── 根据当前配置创建 OpenAI 客户端实例 ──────────────────────────────────────
// 说明：openai 这个 SDK 支持自定义 baseURL，
// 所以不管是 LongCat、DeepSeek 还是 OpenAI，都用同一个客户端，只是地址不同
const provider = AI_PROVIDERS[CURRENT_PROVIDER]

export const aiClient = new OpenAI({
  apiKey: import.meta.env.VITE_AI_API_KEY || '',
  baseURL: provider.baseURL,
  // 前端直接调用 API 需要关闭这个安全限制
  // 正常情况下 openai SDK 不允许在浏览器里使用（防止 key 泄露）
  // 这里我们明确知道自己在做什么，所以手动关闭
  dangerouslyAllowBrowser: true,
})

export const AI_MODEL = provider.model
export const AI_LABEL = provider.label
