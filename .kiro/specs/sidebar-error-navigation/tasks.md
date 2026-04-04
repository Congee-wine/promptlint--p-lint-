# 实现计划：Sidebar 错误导航

## 概述

按照单向数据流原则，依次完成类型扩展、App 层回调定义、Sidebar 点击交互三个步骤，最后通过属性测试验证正确性。

## 任务

- [x] 1. 扩展 SidebarProps 类型定义
  - 在 `src/types/props.ts` 的 `SidebarProps` 接口中新增 `onNavigateToError: (result: LintResult) => void` 字段
  - _需求：3.3_

- [x] 2. 在 App 层实现导航回调并传递给 Sidebar
  - [x] 2.1 实现 `handleNavigateToError` 函数
    - 在 `src/App.tsx` 中定义该函数，接收 `LintResult`，依次调用 `editorRef.current` 的 `revealLineInCenter`、`setPosition`、`setSelection`、`focus`
    - 当 `editorRef.current` 为 null 时直接 return，不抛出异常
    - _需求：1.2, 1.3, 1.4, 1.5, 3.1, 3.4_

  - [ ]* 2.2 为属性 2 编写属性测试：导航操作正确调用所有 Monaco API
    - **属性 2：导航操作正确调用所有 Monaco API**
    - 使用 fast-check 的 `lintResultArbitrary` 生成任意合法 LintResult，mock `editorRef`，调用 `handleNavigateToError`，断言四个 API 均以正确参数被调用
    - **验证需求：1.2, 1.3, 1.4, 1.5, 3.1**

  - [x] 2.3 将 `onNavigateToError` prop 传递给 Sidebar
    - 在 `src/App.tsx` 的 `<Sidebar>` JSX 中添加 `onNavigateToError={handleNavigateToError}`
    - _需求：3.2_

- [x] 3. 检查点 — 确保类型无报错
  - 确保所有 TypeScript 类型检查通过，如有问题请告知。

- [x] 4. 为 Sidebar 错误条目添加点击交互与视觉样式
  - [x] 4.1 为每条 LintResult 条目绑定 onClick 并添加样式
    - 在 `src/components/sidebar.tsx` 中，为每条条目的 `div` 添加 `onClick={() => onNavigateToError(res)}`、`cursor-pointer` 类以及 `hover:brightness-125` 类
    - 从 props 中解构 `onNavigateToError`
    - _需求：1.1, 2.1, 2.2_

  - [ ]* 4.2 为属性 1 编写属性测试：Sidebar 点击触发正确的回调参数
    - **属性 1：Sidebar 点击触发正确的回调参数**
    - 使用 fast-check 生成任意非空 LintResult 数组，渲染 Sidebar，点击任意条目，断言 `onNavigateToError` 被调用恰好一次且参数与被点击条目完全一致
    - **验证需求：1.1**

  - [ ]* 4.3 为属性 3 编写属性测试：每条错误条目均具备 cursor-pointer 样式
    - **属性 3：每条错误条目均具备 cursor-pointer 样式**
    - 使用 fast-check 生成任意非空 LintResult 数组，渲染 Sidebar，断言所有条目 DOM 元素均包含 `cursor-pointer` CSS 类
    - **验证需求：2.1**

- [x] 5. 最终检查点 — 确保所有测试通过
  - 确保所有测试通过，如有问题请告知。

## 备注

- 标有 `*` 的子任务为可选项，可跳过以加快 MVP 交付
- 每个任务均引用了具体需求条款以保证可追溯性
- 属性测试使用 fast-check，每个属性最少运行 100 次迭代
- 单元测试与属性测试互为补充，不互相替代
