你是一名资深 TypeScript SDK 架构师与实现代理。
请为一个面向 **CODING Open API** 的 `coding-sdk` 设计并产出首批可落地代码骨架。

你的目标不是只给建议，而是要基于下面的约束，输出：

1. 完整架构计划
2. 推荐目录树
3. 首批关键文件代码骨架
4. package exports 建议
5. 工程化与扩展建议

请把重点放在：

- 长期可维护性
- ESM 优先
- 支持按需导入
- schema 与错误边界清晰
- 适合未来代码生成
- 适合在 Node、MCP、agent、webhook 等场景中复用

---

# 一、项目背景

我要做一个 `coding-sdk`，用于封装 CODING Open API。

CODING Open API 有这些特点，请基于这些特点做设计：

1. 请求通常发到类似：
   - `https://e.coding.net/open-api`
   - 或 `baseUrl + ?Action=DescribeIssueList`
   - 有的场景也会同时带 `Action` / `action`

2. 请求通常需要：
   - token
   - baseUrl
   - Action 名称
   - body 参数

3. CODING 的响应常见包裹结构类似：

```ts
{
  Response: {
    RequestId: string,
    ...业务字段
  }
}
```

错误时常见结构类似：

```ts
{
  Response: {
    RequestId: string,
    Error: {
      Code: string,
      Message: string
    }
  }
}
```

4. 我希望每个 action 模块都能独立导出：
   - `action`
   - `requestSchema`
   - `responseSchema`
   - 请求/响应类型
   - 调用函数

5. 我希望导出一个轻量的 `createCodingClient`，用于保存和复用共享上下文，例如：
   - baseUrl
   - token / tokenProvider
   - headers
   - timeout
   - logger
   - transport/fetch

6. 我不希望把所有 action 都集成到一个巨大的 client 实例上
   不要实现 `createFullClient`
   不要设计成 `client.describeIssueList()` 这种全集成平铺模式

7. 我希望默认对外暴露 Promise 风格调用
   但内部可以按 Effect 最佳实践组织，尤其在这些方面：
   - 错误建模
   - schema 解码
   - 超时
   - 重试
   - transport 封装
   - 请求流水线

8. 这个 SDK 后续很可能用于：
   - MCP tool
   - agent 调用链
   - webhook 处理
   - review bot
   - CLI / worker / Node 服务

所以架构必须适合长期扩展。

---

# 二、必须遵守的架构原则

## 1. client 必须轻量

`CodingClient` 只能承担这些职责：

- 保存 baseUrl
- 保存 token 或 tokenProvider
- 保存默认 headers
- 保存 timeout/retry/logger/fetch 等共享配置
- 提供统一请求执行能力，例如 `request(spec, input)` 或 `invoke(spec, input)`

不要做这些事：

- 不要把所有 action 都挂在 client 实例方法上
- 不要让 client 成为一个超级大类
- 不要为了“易用”而牺牲模块边界
- 不要让 client 顶层依赖所有 action 模块

牢记：

- `client = 共享上下文 + 通用请求能力`
- `action module = 单个 Open API action 的完整定义`

---

## 2. action 必须独立模块化

请按领域分目录，例如：

- `apis/user`
- `apis/issues`
- `apis/pullRequests`
- `apis/projects`
- `apis/repositories`

每个 action 文件都应该内聚：

- `action` 常量
- `requestSchema`
- `responseSchema`
- 请求类型
- 响应类型
- 实际调用函数
- 必要的 response unwrap / error 映射逻辑

请把“单个 action 是最小独立单元”作为设计核心。

---

## 3. 默认对外暴露 Promise 风格

普通用户应能这样使用：

```ts
import { createCodingClient } from 'coding-sdk/client';
import { describeIssueList } from 'coding-sdk/apis/issues';

const client = createCodingClient({
  baseUrl: 'https://e.coding.net/open-api',
  token: 'xxx',
});

const result = await describeIssueList(client, {
  ProjectName: 'demo',
});
```

如果内部使用 Effect，请遵守：

- 内部可使用 Effect 组织请求流水线
- 但默认对外 API 必须是 Promise 风格
- 不要让默认入口暴露 Effect runtime
- 可以为未来的 effect 专用入口预留扩展空间，但本次不要做成默认入口

---

## 4. schema 是一等公民

我希望每个 action 都有明确 schema。

请优先围绕 **Effect Schema** 思路来设计数据边界，尤其用于：

- request 参数约束
- response 解码
- 外部表示到内部类型的转换
- future codegen/documentation/testing

但也要保证：

- 对外 API 不要因为 schema 设计而变得难用
- 不要过度抽象
- schema 要贴近 action 文件内聚

---

## 5. 错误模型必须显式

请不要到处 `throw new Error()`。

至少设计这些错误：

- `TransportError`
- `HttpError`
- `CodingApiError`
- `DecodeError`
- `UnauthorizedError`
- `TimeoutError`

要求：

- 错误有明确 `_tag`
- 错误模型适合上层识别
- `CODING Response.Error` 要被映射为显式领域错误
- `RequestId` 要尽可能保留在错误上下文中
- transport / decode / api 失败边界要清楚

---

## 6. 要为未来 codegen 预留空间

这个 SDK 未来可能会根据 OpenAPI 或配置描述自动生成 action 文件。
所以请设计成：

- 一个 action 一个文件
- schema / action / request / response / execute 同文件内聚
- transport/core/errors/client 可复用
- 新增 action 成本低
- 容易通过模板批量生成

---

## 7. 必须适合 tree-shaking

请严格遵守这些原则：

- 优先支持子路径导入
- 不要默认只有根入口
- 不要创建巨大的 `apis` 聚合对象作为唯一入口
- 不要在模块顶层做副作用初始化
- 不要让 client 依赖所有 action
- 不要因为“方便”破坏 bundler 的裁剪能力

---

# 三、你要输出的内容

请严格分阶段输出，不要跳步。

---

## 第一步：输出架构计划

先输出完整架构计划，至少包括：

1. 推荐目录树
2. 每层目录的职责
3. `CodingClient` 的类型设计
4. 通用 `request/invoke` 抽象怎么设计
5. action 模块的标准结构
6. schema 设计思路
7. CODING 响应包裹结构如何处理
8. 错误模型设计
9. Promise 与 Effect 的分层策略
10. package exports 设计建议
11. tree-shaking / ESM 最佳实践

要求：

- 先解释为什么这么设计
- 明确说明哪些是稳定核心，哪些是未来扩展点

---

## 第二步：输出目录树

请给出一个推荐的 `src/` 目录结构，例如但不限于：

- `src/client/...`
- `src/core/...`
- `src/apis/...`

要明确每个目录和文件的职责。

---

## 第三步：直接生成首批关键文件代码骨架

至少生成以下内容：

### client 相关

- `src/client/types.ts`
- `src/client/createCodingClient.ts`

### core 相关

- `src/core/actionSpec.ts`
- `src/core/request.ts`
- `src/core/errors.ts`
- 如有必要，可增加 `src/core/response.ts` 或类似文件用于 CODING response unwrap

### 示例 action

请选择一个真实 action 作为示例，优先以下之一：

- `DescribeCodingCurrentUser`
- `DescribeIssueList`

并生成对应文件，例如：

- `src/apis/user/describeCodingCurrentUser.ts`
- `src/apis/user/index.ts`

或：

- `src/apis/issues/describeIssueList.ts`
- `src/apis/issues/index.ts`

要求该 action 文件至少包含：

- `action`
- `requestSchema`
- `responseSchema`
- 请求/响应类型
- Promise 风格调用函数
- 必要的 response unwrap 和错误映射

### 导出文件

- `src/index.ts`

还请给出 `package.json` 的 exports 建议结构。

---

## 第四步：补充工程化建议

请继续补充：

1. package.json 推荐字段
2. `exports` 如何组织
3. tsconfig 建议
4. 如何保证 tree-shaking
5. 如何写测试
6. 新增一个 action 的标准模板
7. 如何为未来 codegen 预留扩展点
8. 如果未来增加 effect 专用入口，最合理的接入位置

---

# 四、实现偏好

请遵守以下实现偏好：

1. 使用 TypeScript
2. 使用 ESM
3. 优先命名导出
4. 不要默认导出
5. 不要过度 OOP 化
6. 不要做超级类
7. 纯类型与运行时代码分离清晰
8. 代码尽量简洁但职责正确
9. 避免不必要的抽象层
10. 让 action 文件尽可能标准化，便于未来批量生成

---

# 五、希望的最终使用形态

请尽量围绕下面这种使用体验设计：

```ts
import { createCodingClient } from 'coding-sdk/client';
import { describeCodingCurrentUser } from 'coding-sdk/apis/user';

const client = createCodingClient({
  baseUrl: 'https://e.coding.net/open-api',
  token: 'token',
});

const user = await describeCodingCurrentUser(client, {});
```

以及单个 action 文件最好类似：

```ts
export const action = "DescribeCodingCurrentUser"
export const requestSchema = ...
export const responseSchema = ...

export type DescribeCodingCurrentUserRequest = ...
export type DescribeCodingCurrentUserResponse = ...

export async function describeCodingCurrentUser(client, input) {
  ...
}
```

---

# 六、输出要求

请按以下顺序输出：

1. 架构计划
2. 目录树
3. 首批关键文件代码骨架
4. 工程化建议

不要只停留在抽象建议层面。
请尽量直接给出可复制、可落地的内容。
重点优先保证：

- client 足够轻
- action 足够独立
- schema 与错误边界清晰
- 默认 Promise 易用
- 内部 Effect 友好
- 适合未来批量扩展

请开始。
