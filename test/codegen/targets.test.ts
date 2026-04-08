import { describe, expect, it } from "vitest";

describe("代码生成测试（targets）", () => {
  it("会把 action 临时骨架输出到 scripts/codegen/out", async () => {
    const { resolveTempActionOutputPath } = await import("../../scripts/codegen/shared.mjs");

    const outputPath = resolveTempActionOutputPath({
      action: "DescribeServiceHooks",
      actionPlacement: "body",
      fileName: "describeServiceHooks",
      hasAuthorizationHeader: true,
      method: "POST",
      path: "/open-api",
      requestFields: [],
      responseFields: [],
    });

    expect(outputPath.replace(/\\/g, "/")).toContain(
      "scripts/codegen/out/describeServiceHooks.generated.ts",
    );
  });

  it("会输出明确的迁移提示", async () => {
    const { renderActionMigrationGuide } = await import("../../scripts/codegen/shared.mjs");

    const guide = renderActionMigrationGuide(
      {
        action: "DescribeServiceHooks",
        actionPlacement: "body",
        fileName: "describeServiceHooks",
        hasAuthorizationHeader: true,
        method: "POST",
        path: "/open-api",
        requestFields: [],
        responseFields: [],
      },
      "C:/repo/scripts/codegen/out/describeServiceHooks.generated.ts",
    );

    expect(guide).toContain("迁移提示：DescribeServiceHooks 已生成到");
    expect(guide).toContain("src/apis/<domain>/describeServiceHooks.ts");
    expect(guide).toContain("迁移完成后删除");
  });
});