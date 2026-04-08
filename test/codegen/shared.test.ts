import path from "node:path";

import { describe, expect, it } from "vitest";

describe("codegen shared schema reuse", () => {
  it("reuses known shared schemas for common component refs", async () => {
    const {
      extractActionManifest,
      loadOpenApiDocument,
      renderActionModule,
      resolveFromRepo,
    } = await import("../../scripts/codegen/shared.mjs");

    const document = await loadOpenApiDocument(resolveFromRepo(".ref/document.yaml"));
    const manifest = extractActionManifest(document);
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

    const currentUserModule = renderActionModule(currentUserAction, currentUserOutput);
    const issueListModule = renderActionModule(issueListAction, issueListOutput);

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
  });
});