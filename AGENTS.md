<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 1. 项目类型

- 框架：Next.js（App Router）
- 语言：TypeScript
- 样式：Tailwind CSS
- 包管理：pnpm（如未安装，使用 npm）

---

## 2. 上下文控制（Codex / Luna 专用）

- 每次只读取**当前任务直接相关的文件**
- 禁止递归读取 `app/`、`components/` 全目录
- 读取文件前先用 `ls` 确认文件名
- 单轮对话中，读取文件总数 ≤ 5 个

---

## 3. 文件与目录约定

- 页面：`app/(route)/page.tsx`
- 布局：`app/(route)/layout.tsx`
- 组件：`components/FeatureName/index.tsx`
- 服务端组件：默认，除非需要交互
- 客户端组件：必须显式写 `'use client'`

---

## 4. 编码规范

- 禁止 `any`，优先 `type` / `interface`
- 异步组件使用 `async function Page()`
- 数据获取优先 `fetch` + `cache: 'force-cache'` 或 `revalidate`
- 环境变量只从 `process.env.NEXT_PUBLIC_*` 读取（客户端）

---

## 5. 工具调用限制

- 优先 `read_file`，禁止 `read_entire_directory`
- 修改文件前必须先 `read_file`
- 禁止一次性调用多个独立工具
- 代码补全单次 ≤ 200 行
- 解释说明单次 ≤ 300 字

---

## 6. 错误处理

- 遇到 TPM / rate limit 报错，立即缩减上下文
- 不要重试原请求
- 主动拆分大任务为小步骤

---

## 7. 禁止行为

- 禁止修改 `node_modules`
- 禁止提交 `.next/`、`out/`、`dist/`
- 禁止在生产代码中使用 `console.log`
- 禁止忽略 TypeScript 报错

---

## 8. 常用命令

- dev: `pnpm dev`
- build: `pnpm build`
- lint: `pnpm lint`
- typecheck: `pnpm typecheck`
