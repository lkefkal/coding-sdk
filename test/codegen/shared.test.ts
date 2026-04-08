import path from "node:path";

import { describe, expect, it } from "vitest";

describe("代码生成测试（shared）", () => {
  it("会为常见 component ref 复用已有共享 schema", async () => {
    const {
      extractActionManifest,
      extractComponentManifest,
      loadOpenApiDocument,
      renderActionModule,
      resolveFromRepo,
    } = await import("../../scripts/codegen/shared.mjs");

    const document = await loadOpenApiDocument(resolveFromRepo(".ref/document.yaml"));
    const manifest = extractActionManifest(document);
    const componentManifest = extractComponentManifest(document);
    const currentUserAction = manifest.find(
      (entry) => entry.action === "DescribeCodingCurrentUser",
    );
    const issueListAction = manifest.find(
      (entry) => entry.action === "DescribeIssueList",
    );

    expect(currentUserAction).toBeDefined();
    expect(issueListAction).toBeDefined();

    if (currentUserAction == null || issueListAction == null) {
      throw new Error("Expected known actions to exist in the extracted manifest.");
    }

    const currentUserOutput = path.join(
      resolveFromRepo("scripts/codegen/out"),
      "describeCodingCurrentUser.generated.ts",
    );
    const issueListOutput = path.join(
      resolveFromRepo("scripts/codegen/out"),
      "describeIssueList.generated.ts",
    );

    const currentUserModule = renderActionModule(
      currentUserAction,
      currentUserOutput,
      componentManifest,
    );
    const issueListModule = renderActionModule(
      issueListAction,
      issueListOutput,
      componentManifest,
    );

    expect(currentUserModule).toContain(
      'import { currentUserSchema } from "../../../src/schemas/user.js";',
    );
    expect(currentUserModule).toContain("User: Schema.NullOr(currentUserSchema)");
    expect(issueListModule).toContain(
      'import { issueConditionSchema, issueListItemSchema } from "../../../src/schemas/issues.js";',
    );
    expect(issueListModule).toContain(
      "Conditions: Schema.optional(Schema.Array(issueConditionSchema))",
    );
    expect(issueListModule).toContain(
      "IssueList: Schema.Array(issueListItemSchema)",
    );
    expect(currentUserModule).toContain("* 调用 DescribeCodingCurrentUser action，并返回经过 schema 解码后的结果。");
  });

  it("会把未知响应 ref 递归展开为本地 helper schema", async () => {
    const {
      extractActionManifest,
      extractComponentManifest,
      loadOpenApiDocument,
      renderActionModule,
      resolveFromRepo,
    } = await import("../../scripts/codegen/shared.mjs");

    const document = await loadOpenApiDocument(resolveFromRepo(".ref/document.yaml"));
    const manifest = extractActionManifest(document);
    const componentManifest = extractComponentManifest(document);
    const actionEntry = manifest.find(
      (entry) => entry.action === "DescribeServiceHooks",
    );

    expect(actionEntry).toBeDefined();

    if (actionEntry == null) {
      throw new Error("Expected DescribeServiceHooks to exist in the extracted manifest.");
    }

    const outputPath = path.join(
      resolveFromRepo("scripts/codegen/out"),
      "describeServiceHooks.generated.ts",
    );
    const moduleText = renderActionModule(actionEntry, outputPath, componentManifest);

    expect(moduleText).toContain("const serviceHookUserSchema = Schema.Struct({");
    expect(moduleText).toContain("const serviceHookSchema = Schema.Struct({");
    expect(moduleText).toContain("const serviceHookPageSchema = Schema.Struct({");
    expect(moduleText).toContain("CreatorByUser: serviceHookUserSchema");
    expect(moduleText).toContain("Data: serviceHookPageSchema");
    expect(moduleText).toContain("* 调用 DescribeServiceHooks action，并返回经过 schema 解码后的结果。");
  });
});