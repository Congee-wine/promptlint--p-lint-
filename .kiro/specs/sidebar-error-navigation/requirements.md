# 需求文档

## 简介

本功能为 PromptLint 项目的 Sidebar 错误导航功能。当用户在 Sidebar 中点击某条 lint 错误/警告条目时，编辑器将自动跳转到对应的错误行，并将光标定位到精确的起始列，同时高亮选中该错误范围，帮助用户快速定位和修复问题。

## 词汇表

- **Sidebar**：左侧面板组件（`sidebar.tsx`），展示 lint 扫描结果列表
- **EditorPanel**：编辑器面板组件（`editorPanel.tsx`），包含 Monaco Editor 实例
- **LintResult**：lint 扫描结果对象，包含 `startLineNumber`、`startColumn`、`endLineNumber`、`endColumn`、`ruleId`、`severity`、`message` 字段
- **Monaco_Editor**：编辑器核心实例，通过 `editorRef` 引用，提供 `revealLineInCenter`、`setPosition`、`setSelection` 等导航 API
- **NavigateToError**：跳转到错误位置的操作，包括滚动视图、移动光标、选中错误范围
- **App**：顶层组件（`App.tsx`），负责协调 Sidebar 与 EditorPanel 之间的通信

## 需求

### 需求 1：点击错误条目跳转到对应行

**用户故事：** 作为一名 Prompt 编写者，我希望点击 Sidebar 中的错误条目后，编辑器能自动跳转到对应的错误行，以便我能快速定位并修复问题。

#### 验收标准

1. WHEN 用户点击 Sidebar 中的某条 LintResult 条目，THE Sidebar SHALL 触发 NavigateToError 操作，并将该 LintResult 的位置信息传递给 App。
2. WHEN NavigateToError 操作被触发，THE Monaco_Editor SHALL 将视图滚动至目标行并使其在编辑器中居中显示。
3. WHEN NavigateToError 操作被触发，THE Monaco_Editor SHALL 将光标移动到目标 LintResult 的 `startLineNumber` 行、`startColumn` 列。
4. WHEN NavigateToError 操作被触发，THE Monaco_Editor SHALL 选中从 `startLineNumber:startColumn` 到 `endLineNumber:endColumn` 的文本范围。
5. WHEN NavigateToError 操作被触发，THE Monaco_Editor SHALL 获取焦点，使编辑器处于可交互状态。

### 需求 2：错误条目的可点击视觉反馈

**用户故事：** 作为一名 Prompt 编写者，我希望 Sidebar 中的错误条目在视觉上表现为可点击状态，以便我能直观地感知该交互的存在。

#### 验收标准

1. THE Sidebar SHALL 为每条 LintResult 条目添加 `cursor-pointer` 样式，表明其可被点击。
2. WHEN 用户将鼠标悬停在某条 LintResult 条目上，THE Sidebar SHALL 以视觉高亮（如背景色加深）反馈当前悬停状态。

### 需求 3：App 层协调 Sidebar 与 EditorPanel 的通信

**用户故事：** 作为开发者，我希望 App 组件能统一协调 Sidebar 与 EditorPanel 之间的跳转通信，以便保持组件职责清晰、数据流单向。

#### 验收标准

1. THE App SHALL 定义 `onNavigateToError` 回调函数，接收 LintResult 位置信息，并调用 Monaco_Editor 的导航 API 执行跳转。
2. THE App SHALL 将 `onNavigateToError` 作为 prop 传递给 Sidebar 组件。
3. THE SidebarProps SHALL 包含 `onNavigateToError` 字段，类型为接收 LintResult 并返回 void 的函数。
4. IF `editorRef.current` 为 null，THEN THE App SHALL 忽略本次 NavigateToError 操作，不抛出异常。
