# Codegen Scaffold

这个目录先提供两类基础能力，用来为后续全量 action codegen 打底：

1. 从 .ref/document.yaml 提取 action manifest。
2. 基于 manifest 生成单个 action 的标准模块骨架。

## 命令

生成完整 manifest：

```bash
npm run codegen:manifest -- --output scripts/codegen/out/action-manifest.json
```

只提取单个 action：

```bash
npm run codegen:manifest -- --action DescribeIssueList
```

生成单个 action 模块骨架到文件：

```bash
npm run codegen:action -- --action DescribeCodingCurrentUser --output scripts/codegen/out/describeCodingCurrentUser.ts
```

生成单个共享 schema 模块骨架到文件：

```bash
npm run codegen:schema -- --component CurrentUser --output scripts/codegen/out/currentUser.generated.ts
```

## 当前范围

- 已提取：action 名称、路径、方法、Action 放置策略、超时、标签、请求字段、响应字段。
- 已生成：action 常量、requestSchema、responseSchema、类型、spec、Promise 调用函数。
- 已生成：单个 component 的共享 schema 模块骨架。
- 已支持：对已知组件 ref 复用 src/schemas 下的共享 schema，而不是一律回退成 Schema.Unknown。
- 当前已内置的复用映射包括 CurrentUser、IssueListData、IterationSimple、IssueCondition、IssueCustomField、IssueTypeDetail。
- 对于未知但可解析的 component ref，`codegen:schema` 会在生成文件内递归展开为本地 helper schema，而不是直接丢成 Schema.Unknown。
- 当前不会自动解析复杂 $ref 并展开成完整领域 schema。
- 遇到 object、$ref、复杂数组时，生成器会保守回退到 Schema.Unknown 或 Schema.Array(Schema.Unknown)。

## 设计约束

- 生成结果遵循现有 action 文件模板，便于手工修正后直接纳入 src/apis。
- 共享 schema 生成默认写到 scripts/codegen/out，避免误覆盖现有 src/schemas 手写文件。
- 生成器只负责“可编译的标准骨架”，不负责把所有组件 schema 都完整映射出来。
- 后续如果要做全量 codegen，优先扩展 shared.mjs 里的 manifest 和字段映射逻辑，而不是重写 action 模板。
