import { describe, expect, it } from "vitest";

describe("codegen 生成目录辅助函数", () => {
  it("会为 generated 文件渲染稳定的 barrel 模块", async () => {
    const { renderGeneratedIndexModule } = await import("../../scripts/codegen/shared.mjs");

    const barrel = renderGeneratedIndexModule([
      "serviceHookPage.generated.ts",
      "index.ts",
      "describeServiceHooks.ts",
    ]);

    expect(barrel).toBe(
      [
        'export * from "./describeServiceHooks.js";',
        'export * from "./serviceHookPage.generated.js";',
        "",
      ].join("\n"),
    );
  });

  it("在没有生成文件时返回空模块", async () => {
    const { renderGeneratedIndexModule } = await import("../../scripts/codegen/shared.mjs");

    expect(renderGeneratedIndexModule(["index.ts"])).toBe("export {};\n");
  });
});