# coding-sdk

面向 CODING Open API 的 ESM 优先 TypeScript SDK。

这个包提供三层稳定能力：

- 轻量共享客户端，用于统一 baseUrl、鉴权、超时、重试和日志配置。
- 按域拆分的 action 模块，用于按需导入具体接口能力。
- 可复用的 Effect Schema 运行时 schema 与类型，用于响应解码和上层二次组合。

设计目标：

- ESM first，适合现代 Node.js 与构建工具。
- 按需导入，避免把所有接口打进同一个入口。
- 请求和响应在运行时通过 schema 校验，尽早暴露不符合预期的数据。
- 提供稳定错误类型，便于上层做分类处理。

## 安装

```bash
npm install coding-sdk effect
```

说明：

- 运行环境要求 Node.js 18 及以上。
- 包默认使用全局 fetch；如果运行环境没有可用 fetch，请在创建客户端时显式传入。
- effect 是运行时依赖，已经由本包声明；显式安装有助于某些工作区或调试场景保持依赖清晰。

## 快速开始

```ts
import { createCodingClient, isCodingSdkError } from 'coding-sdk';
import { describeCodingCurrentUser } from 'coding-sdk/apis/user';

const client = createCodingClient({
  baseUrl: 'https://e.coding.net/open-api',
  token: process.env.CODING_TOKEN,
});

async function main() {
  try {
    const result = await describeCodingCurrentUser(client, {});

    console.log(result.RequestId);
    console.log(result.User.Name);
    console.log(result.User.GlobalKey);
  } catch (error) {
    if (isCodingSdkError(error)) {
      console.error(error._tag, error.message, error.requestId);
      return;
    }

    throw error;
  }
}

void main();
```

## 创建客户端

```ts
import { createCodingClient } from 'coding-sdk';

const client = createCodingClient({
  baseUrl: 'https://e.coding.net/open-api',
  token: process.env.CODING_TOKEN,
  timeoutMs: 5_000,
  headers: {
    'X-Request-Source': 'my-app',
  },
  retry: {
    maxAttempts: 2,
    baseDelayMs: 150,
    maxDelayMs: 1_000,
  },
  logger: {
    debug(message, meta) {
      console.debug(message, meta);
    },
    warn(message, meta) {
      console.warn(message, meta);
    },
    error(message, meta) {
      console.error(message, meta);
    },
  },
});
```

`createCodingClient` 支持的核心参数：

- `baseUrl`：CODING Open API 地址，通常为 `https://e.coding.net/open-api`。
- `token`：直接传入 token，默认按 `Bearer` 方案写入 `Authorization`。
- `tokenType`：自定义 token 方案，默认值为 `Bearer`。
- `tokenProvider`：按请求动态提供 token 或完整鉴权结构。
- `auth`：直接提供 `{ scheme, value }` 形式的鉴权信息。
- `headers`：所有请求共享的默认请求头。
- `timeoutMs`：默认超时时间，单位毫秒。
- `retry`：重试策略，仅对可重试状态码和错误标签生效。
- `fetch`：显式传入 fetch 实现。
- `logger`：接入你自己的日志系统。

鉴权优先级：

1. `auth`
2. `token`
3. `tokenProvider`

如果你需要每次请求前动态刷新 token，可以这样写：

```ts
import { createCodingClient } from 'coding-sdk';

const client = createCodingClient({
  baseUrl: 'https://e.coding.net/open-api',
  tokenProvider: async () => {
    const token = await getFreshToken();
    return token;
  },
});

async function getFreshToken(): Promise<string> {
  return 'your-token';
}
```

如果 CODING 环境使用的并不是 Bearer token，而是其他 Authorization 方案，可以直接传入完整结构：

```ts
import { createCodingClient } from 'coding-sdk';

const client = createCodingClient({
  baseUrl: 'https://e.coding.net/open-api',
  auth: {
    scheme: 'Basic',
    value: 'base64-credentials',
  },
});
```

## 企业内 token 刷新接入示例

很多企业内网场景不会把长期 token 直接下发到业务服务，而是要求业务服务先向统一鉴权网关换取短期访问凭证。这种情况下，建议只配置 `tokenProvider`，并在 provider 内部自行做缓存、过期判断和并发合并。

注意：如果同时配置了 `auth` 或 `token`，SDK 会优先使用它们，`tokenProvider` 不会参与当前请求。

```ts
import { createCodingClient } from 'coding-sdk';

interface AccessTokenSnapshot {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: AccessTokenSnapshot | undefined;
let refreshingToken: Promise<AccessTokenSnapshot> | undefined;

function isTokenValid(
  snapshot: AccessTokenSnapshot | undefined,
): snapshot is AccessTokenSnapshot {
  if (snapshot == null) {
    return false;
  }

  const refreshBufferMs = 60_000;
  return snapshot.expiresAt - Date.now() > refreshBufferMs;
}

async function requestTokenFromGateway(): Promise<AccessTokenSnapshot> {
  const response = await fetch('https://auth.example.internal/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audience: 'coding-open-api',
      clientId: process.env.INTERNAL_CLIENT_ID,
      clientSecret: process.env.INTERNAL_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `鉴权网关换取 token 失败: ${response.status} ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as {
    accessToken: string;
    expiresIn: number;
  };

  return {
    accessToken: payload.accessToken,
    expiresAt: Date.now() + payload.expiresIn * 1_000,
  };
}

async function getAccessToken(): Promise<string> {
  if (isTokenValid(cachedToken)) {
    return cachedToken.accessToken;
  }

  if (refreshingToken == null) {
    refreshingToken = requestTokenFromGateway().finally(() => {
      refreshingToken = undefined;
    });
  }

  cachedToken = await refreshingToken;
  return cachedToken.accessToken;
}

const client = createCodingClient({
  baseUrl: 'https://e.coding.net/open-api',
  tokenProvider: getAccessToken,
});
```

这段接入方式有几个实际价值：

- 避免每个请求都访问鉴权网关。
- 在 token 即将过期时提前刷新，而不是等到 401 再补救。
- 多个并发请求只会触发一次刷新，避免把内部鉴权服务打爆。

如果你的内部网关直接返回完整鉴权结构，而不是只返回 token 字符串，也可以让 `tokenProvider` 返回对象：

```ts
import { createCodingClient } from 'coding-sdk';

const client = createCodingClient({
  baseUrl: 'https://e.coding.net/open-api',
  tokenProvider: async () => {
    const credential = await getCredentialFromGateway();

    return {
      scheme: credential.scheme,
      value: credential.token,
    };
  },
});

async function getCredentialFromGateway(): Promise<{
  scheme: string;
  token: string;
}> {
  return {
    scheme: 'Bearer',
    token: 'your-token',
  };
}
```

## 按域导入接口

这个包不会在根入口聚合所有 action。推荐优先按域导入：

```ts
import { describeCodingCurrentUser } from 'coding-sdk/apis/user';
import { describeIssueList } from 'coding-sdk/apis/issues';
import { describeOneProject } from 'coding-sdk/apis/projects';
import { describeMergeRequest } from 'coding-sdk/apis/mergeRequests';
import { describeServiceHooks } from 'coding-sdk/apis/serviceHooks';
```

这样可以保持导入边界清晰，也更利于 tree-shaking。

如果你在另一个项目里想先集中浏览当前已公开的 action，也可以使用能力级聚合入口：

```ts
import {
  describeCodingCurrentUser,
  describeIssueList,
  describeMergeRequest,
  describeOneProject,
  describeServiceHooks,
} from 'coding-sdk/apis';
```

这个入口主要用于提升导出可发现性；正式接入时，仍建议回到按域导入。

## 读取事项列表示例

```ts
import { createCodingClient } from 'coding-sdk';
import { describeIssueList } from 'coding-sdk/apis/issues';

const client = createCodingClient({
  baseUrl: 'https://e.coding.net/open-api',
  token: process.env.CODING_TOKEN,
});

const result = await describeIssueList(client, {
  IssueType: 'ALL',
  Limit: 10,
  Offset: 0,
  ProjectName: 'demo-project',
  SortKey: 'CODE',
  SortValue: 'DESC',
});

for (const issue of result.IssueList) {
  console.log(issue.Code, issue.Name, issue.IssueStatusName);
}
```

## 创建 Service Hook 示例

```ts
import { createCodingClient } from 'coding-sdk';
import { createServiceHook } from 'coding-sdk/apis/serviceHooks';

const client = createCodingClient({
  baseUrl: 'https://e.coding.net/open-api',
  token: process.env.CODING_TOKEN,
});

const result = await createServiceHook(client, {
  ActionProperty: '{}',
  Enabled: true,
  Event: ['ISSUE_CREATED'],
  ProjectId: 1001,
  Service: 'WeCom',
  ServiceAction: 'wecom_group_chat_robot',
  TargetType: 'PROJECT',
});

console.log(result.ServiceHook.Id);
console.log(result.ServiceHook.Name);
```

## 请求级覆盖

除了客户端级配置，每次 action 调用也可以传入局部覆盖：

```ts
import { createCodingClient } from 'coding-sdk';
import { describeCodingCurrentUser } from 'coding-sdk/apis/user';

const client = createCodingClient({
  baseUrl: 'https://e.coding.net/open-api',
  token: process.env.CODING_TOKEN,
});

const result = await describeCodingCurrentUser(
  client,
  {},
  {
    timeoutMs: 10_000,
    headers: {
      'X-Trace-Id': 'trace-001',
    },
    query: {
      Version: '2023-01-01',
    },
  },
);
```

常见请求级参数：

- `headers`：本次调用附加请求头。
- `signal`：接入外部 `AbortSignal`。
- `timeoutMs`：覆盖默认超时时间。
- `retry`：覆盖默认重试策略。
- `query`：在请求 URL 上附加额外 query 参数。
- `actionPlacementOverride`：覆盖当前 action 的 Action 注入位置，仅用于兼容少量文档与实际行为不一致的接口。

## 错误处理

所有 SDK 稳定错误都继承自 `CodingSdkError`，并带有稳定 `_tag` 字段，便于分类处理。

常见错误类型：

- `TransportError`：网络层异常、调用方主动取消等传输失败。
- `TimeoutError`：请求超时。
- `HttpError`：非 2xx HTTP 状态码。
- `UnauthorizedError`：401、403，或 CODING 返回鉴权相关业务错误。
- `CodingApiError`：CODING 在 `Response.Error` 中返回的业务错误。
- `DecodeError`：请求或响应数据不符合 schema。

推荐的处理方式：

```ts
import {
  CodingApiError,
  TimeoutError,
  UnauthorizedError,
  isCodingSdkError,
} from 'coding-sdk';

try {
  // 调用任意 action
} catch (error) {
  if (!isCodingSdkError(error)) {
    throw error;
  }

  if (error instanceof UnauthorizedError) {
    console.error('鉴权失败，请检查 token', error.requestId);
    return;
  }

  if (error instanceof TimeoutError) {
    console.error('请求超时，请稍后重试', error.requestId);
    return;
  }

  if (error instanceof CodingApiError) {
    console.error('业务错误', error.code, error.message, error.requestId);
    return;
  }

  console.error(error._tag, error.message, error.requestId);
}
```

## 导出入口

根入口：

- `coding-sdk`

稳定子路径入口：

- `coding-sdk/apis`
- `coding-sdk/client`
- `coding-sdk/errors`
- `coding-sdk/schemas`
- `coding-sdk/schemas/user`
- `coding-sdk/schemas/issues`
- `coding-sdk/schemas/projects`
- `coding-sdk/schemas/mergeRequests`
- `coding-sdk/schemas/serviceHooks`
- `coding-sdk/apis/user`
- `coding-sdk/apis/issues`
- `coding-sdk/apis/projects`
- `coding-sdk/apis/mergeRequests`
- `coding-sdk/apis/serviceHooks`

如果你只需要共享 schema，也可以直接按子路径导入：

```ts
import { issueListItemSchema } from 'coding-sdk/schemas/issues';
import type { IssueListItem } from 'coding-sdk/schemas/issues';
```

## 当前覆盖能力

当前仓库已经稳定提供以下域能力：

- 用户信息
- 事项列表、详情、评论、日志、工时、状态变更、关联资源、自定义字段变更
- 项目查询、项目成员、项目仓库、项目凭据、项目合并请求
- 合并请求列表、详情、Diff、评论、Reviewer
- Service Hook 查询、创建、修改、启用、删除、测试

每个 action 都以独立函数形式暴露，命名与 CODING Open API action 保持一致的英文语义。

## 开发校验

仓库内常用校验命令：

```bash
npm run typecheck
npm run test
npm run build
npm run verify
```

其中 `verify` 会顺序执行类型检查、测试、构建以及 `npm pack --dry-run`。
