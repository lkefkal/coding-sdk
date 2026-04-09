import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import * as apis from "../../src/apis/index.js";

describe("API 聚合入口测试（apis/index）", () => {
  it("会聚合所有稳定域入口，便于集中浏览公开 action", () => {
    expect(apis.describeCodingCurrentUser).toBeTypeOf("function");
    expect(apis.describeIssueList).toBeTypeOf("function");
    expect(apis.describeOneProject).toBeTypeOf("function");
    expect(apis.describeMergeRequest).toBeTypeOf("function");
    expect(apis.describeServiceHooks).toBeTypeOf("function");
  });

  it("会声明稳定的 ./apis 子路径导出", () => {
    const packageJson = JSON.parse(
      readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
    ) as {
      exports?: Record<string, { import?: string; types?: string; } | string>;
    };

    expect(packageJson.exports).toMatchObject({
      "./apis": {
        import: "./dist/apis/index.js",
        types: "./dist/apis/index.d.ts",
      },
    });
  });
});