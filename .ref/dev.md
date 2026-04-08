# coding-sdk 开发规范

本文档用于约束 coding-sdk 仓库中的实现风格、文档风格与工程边界。

## 1. 总原则

- 以函数式编程为主，不引入不必要的类层级、继承体系或可变对象封装。
- 优先编写纯函数；副作用必须收敛在明确边界，例如请求发送、日志输出、文件生成、终端命令执行。
- 保持模块边界清晰：client 负责共享上下文，core 负责稳定基础设施，apis 负责单 action，schemas 负责共享领域 schema。
- 优先保证可维护性、可测试性、可生成性，再考虑语法层面的“简短”。
- 所有新增代码都必须服务于现有架构，不得为局部便利破坏 tree-shaking、ESM 导出边界或 action 独立性。

## 2. 函数式编程规范

- 禁止把业务逻辑堆进大型类或可变单例。
- 函数必须单一职责，一个函数只解决一个明确问题。
- 优先使用显式输入和显式返回值，不依赖隐藏上下文或隐式全局状态。
- 默认视数据为不可变值；不要在函数内部就地修改传入对象或数组。
- 副作用函数必须靠近边界层，纯计算函数必须尽量保持无副作用。
- 组合优先于继承，数据变换优先于命令式分支堆叠。
- 公共逻辑优先抽成小型可组合函数，不要重复散落在多个 action 文件里。

## 3. 文本与语言规范

- 所有描述性文本必须使用中文。
- 描述性文本包括但不限于：JSDoc、注释、README、开发文档、测试用例描述、错误说明、日志文案、计划说明。
- 代码标识符、API 字段名、OpenAPI action 名称、导出名称保持英文，不做中文化改名。
- 如需同时保留英文原词，写法应为“中文说明（EnglishTerm）”，不能只写英文描述。

## 4. JSDoc 规范

- 所有方法都必须写 JSDoc。
- 这里的“方法”包括：
  - 所有导出的函数。
  - 所有非平凡内部函数。
  - 所有脚本入口函数。
- 简单常量导出可以不写 JSDoc，但复杂 schema、错误类型工厂函数、生成器入口、核心请求函数必须写。
- JSDoc 描述必须使用中文。
- JSDoc 至少包含功能说明；有参数时必须补 `@param`；有返回值时必须补 `@returns`；可能抛错时必须补 `@throws`。
- 对外公共 API 在必要时应补 `@example`。

推荐模板：

```ts
/**
 * 调用指定的 CODING Open API action，并返回经过 schema 解码后的结果。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的 action 响应结果。
 * @throws {DecodeError} 当响应结构与 schema 不匹配时抛出。
 * @throws {CodingApiError} 当 CODING 返回显式业务错误时抛出。
 */
export async function describeSomething(...) {
  // ...
}
```

## 5. TypeScript 规范

- 启用并保持严格类型检查，不得为省事关闭 strict 相关能力。
- 禁止滥用 `any`；确实无法收窄时优先使用 `unknown`，并在边界处做显式解码。
- 禁止无说明地使用非空断言。
- 类型命名必须稳定、可读，并与 schema 或领域对象一一对应。
- 运行时边界优先由 schema 表达，类型应尽量从 schema 推导，而不是手写重复类型。
- 新增共享领域结构时，优先放到 `src/schemas`，避免在 action 文件中重复定义。

## 6. 模块与目录规范

- `src/client`：只放客户端上下文与公开 client 类型，不依赖所有 action。
- `src/core`：只放稳定基础设施，例如 actionSpec、request、response、errors、auth。
- `src/apis/<domain>`：一文件一个 action，action 是最小独立单元。
- `src/schemas`：放可复用领域 schema，不放请求执行逻辑。
- `src/internal`：仅放内部实现细节，不作为默认公开 API 面。
- `scripts/codegen`：只放代码生成器与相关工具，不掺杂运行时业务逻辑。

## 7. Action 文件规范

- 每个 action 文件必须保持标准结构。
- 默认导出内容顺序如下：
  - `action`
  - `requestSchema`
  - `responseSchema`
  - 请求类型
  - 响应类型
  - `xxxSpec`
  - `xxx` 调用函数
- action 文件内不应塞入与当前 action 无关的共享工具函数。
- 共享 schema 必须优先复用 `src/schemas` 中已有定义。
- 请求与响应的描述保持贴近 OpenAPI 原始字段，不做不必要的语义改写。

## 8. Client 与 Core 规范

- `createCodingClient` 必须保持轻量，只负责共享配置归一化与统一 invoke 能力。
- 不允许引入 `createFullClient` 或 `client.xxxAction()` 的全集成平铺模式。
- 错误边界必须显式，禁止到处直接 `throw new Error()`。
- `RequestId`、`action`、`cause` 等上下文信息要尽量保留在错误对象中。
- Promise 是默认公开接口；内部可以使用 Effect 组织实现，但不得把 Effect runtime 暴露给默认用户。

## 9. 导入导出规范

- 使用 ESM。
- 优先命名导出，禁止默认导出。
- 根入口保持最小暴露，不聚合所有 action。
- 子路径导出优先，保证按需导入和 tree-shaking。
- 不在模块顶层做有副作用的初始化。

## 10. 注释规范

- 注释必须解释“为什么”，而不是机械解释“做了什么”。
- 能靠命名表达清楚的逻辑，不要再补重复注释。
- 注释语言必须是中文。
- 复杂分支、兼容性行为、OpenAPI 偏差处理、生成器回退策略需要有简洁中文注释。

## 11. 错误处理规范

- 优先使用显式错误类型，例如 `TransportError`、`HttpError`、`CodingApiError`、`DecodeError`、`UnauthorizedError`、`TimeoutError`。
- 每类错误都要有稳定 `_tag`，便于上层识别。
- 保留 OpenAPI 原始 `Code` 与 `RequestId`，不要吞掉原始错误上下文。
- 错误消息和日志说明使用中文；外部协议字段保持原样。

## 12. 测试规范

- 新增行为必须伴随测试。
- 修复 bug 时必须补回归测试。
- 修改 schema 严格度时，必须同步更新相关测试夹具。
- 修改 codegen 时，至少补一条输出断言测试，验证生成结果的关键结构。
- 测试描述文本使用中文。

## 13. Codegen 规范

- 代码生成器优先输出“可编译、可理解、可接手继续完善”的结果。
- 已知共享 schema 必须优先复用，而不是重复生成。
- 未知但可解析的 component ref，优先递归展开成局部 helper schema；只有无法解析时才回退到 `Schema.Unknown`。
- 默认生成结果优先写入安全目录，例如 `scripts/codegen/out` 或 `src/**/generated`，避免覆盖手写文件。
- 生成器逻辑必须可测试，不允许只靠人工肉眼检查输出。

## 14. 命名规范

- 文件名、函数名、类型名与 action 名称保持英文，与 OpenAPI 语义一致。
- 描述性文本、注释、JSDoc、文档说明统一用中文。
- 函数命名使用动词或动词短语；schema 命名统一以 `Schema` 结尾；类型命名使用领域名词。

## 15. 提交流程规范

- 修改前先确认是否存在可复用实现，避免重复造轮子。
- 修改后至少执行与变更相关的校验：`typecheck`、`test`、`build`、codegen 脚本验证。
- 没有通过验证的代码不得视为完成。

## 16. 优先级规则

当规范冲突时，按以下优先级处理：

1. 仓库现有公开架构边界。
2. 本文档。
3. 局部文件现有风格。
4. 个人偏好。

如需突破本文档，必须在变更说明中写明原因。