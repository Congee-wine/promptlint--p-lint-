# PromptLint

一个面向 AI Prompt 工程师的实时静态分析与智能优化工具。在编写 Prompt 的同时，即时发现结构缺陷、模糊用词和逻辑冲突，并借助 AI 深度评审与一键重构能力，帮助你写出更健壮、更精准的 Prompt。

## 功能特性

**实时静态扫描**
- 检测模糊形容词（如"极速"、"智能"、"强大"等），提示替换为可量化指标
- 检查 Prompt 结构完整性（Role / Task / AC 是否齐全）
- 识别逻辑冲突（如"极速"与"不封号"同时出现）
- 错误和警告实时标注在编辑器行内

**错误导航**
- 点击左侧面板的任意错误/警告条目，编辑器自动滚动并精准定位到对应行
- 跳转时触发按 severity 区分颜色的临时高亮（error 红色 / warning 黄色 / info 蓝色），1.5 秒后自动消失

**AI 深度评审**（需要 Gemini API Key）
- 对 Prompt 进行逻辑一致性分析，输出 0-100 健壮性评分
- 列出逻辑冲突和改进建议

**一键结构化重构**（需要 Gemini API Key）
- 将任意格式的 Prompt 自动重构为标准 Markdown 结构（Role / Context / Task / AC / Constraints）

**编辑器功能**
- 基于 Monaco Editor，支持 Markdown 语法高亮
- 历史记录管理，自动保存编辑内容
- 支持导入 `.md` / `.txt` 文件，一键导出

## 技术栈

- React 19 + TypeScript
- Monaco Editor (`@monaco-editor/react`)
- Vite 6
- Tailwind CSS 4
- Google Gemini API (`@google/genai`)

## 快速开始

**前置要求：** Node.js 18+，pnpm

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env.local
# 在 .env.local 中填入你的 Gemini API Key：
# GEMINI_API_KEY=your_api_key_here

# 启动开发服务器
pnpm dev
```

访问 `http://localhost:3000` 即可使用。

> AI 深度评审和一键重构功能需要有效的 Gemini API Key。静态扫描功能无需 API Key，可离线使用。

## 项目结构

```
src/
├── components/
│   ├── sidebar.tsx       # 左侧面板：得分、扫描结果、AI 评审
│   ├── editorPanel.tsx   # 编辑器面板：Monaco Editor + 工具栏
│   └── historyPanel.tsx  # 历史记录面板
├── hooks/
│   ├── useLint.ts        # 实时 lint 逻辑，管理 Monaco markers
│   └── usePromptAI.ts    # AI 深度评审 & 一键重构
├── rules/
│   └── rules.ts          # 静态规则定义（模糊词表、结构规则）
├── services/
│   └── lintService.ts    # lint 引擎 + Gemini API 调用
└── types/                # TypeScript 类型定义
```
