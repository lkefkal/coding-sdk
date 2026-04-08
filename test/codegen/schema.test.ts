import path from "node:path";

import { describe, expect, it } from "vitest";

describe("codegen shared schema module generation", () => {
  it("renders known components with stable export names", async () => {
    const {
      extractComponentManifest,
      loadOpenApiDocument,
      renderSharedSchemaModule,
      resolveFromRepo,
    } = await import("../../scripts/codegen/shared.mjs");

    const document = await loadOpenApiDocument(resolveFromRepo(".ref/document.yaml"));
    const manifest = extractComponentManifest(document);
    const currentUserComponent = manifest.find(
      (entry) => entry.componentName === "CurrentUser",
    );
    const issueListDataComponent = manifest.find(
      (entry) => entry.componentName === "IssueListData",
    );

    expect(currentUserComponent).toBeDefined();
    expect(issueListDataComponent).toBeDefined();

    if (currentUserComponent == null || issueListDataComponent == null) {
      throw new Error("Expected known components to exist in the extracted component manifest.");
    }

    const currentUserOutput = path.join(
      resolveFromRepo("scripts/codegen/out"),
      currentUserComponent.generatedFileName,
    );
    const issueListOutput = path.join(
      resolveFromRepo("scripts/codegen/out"),
      issueListDataComponent.generatedFileName,
    );

    const currentUserModule = renderSharedSchemaModule(
      currentUserComponent,
      currentUserOutput,
      manifest,
    );
    const issueListModule = renderSharedSchemaModule(
      issueListDataComponent,
      issueListOutput,
      manifest,
    );

    expect(currentUserModule).toContain("export const currentUserSchema = Schema.Struct({");
    expect(currentUserModule).toContain("Id: Schema.Number");
    expect(currentUserModule).toContain(
      "export type CurrentUser = Schema.Schema.Type<typeof currentUserSchema>;",
    );
    expect(issueListModule).toContain("export const issueListItemSchema = Schema.Struct({");
    expect(issueListModule).toContain("Code: Schema.Number");
    expect(issueListModule).toContain(
      'import { issueCustomFieldSchema, issueIterationSchema, issueTypeDetailSchema } from "../../../src/schemas/issues.js";',
    );
    expect(issueListModule).toContain(
      "CustomFields: Schema.optional(Schema.NullOr(Schema.Array(issueCustomFieldSchema)))",
    );
    expect(issueListModule).toContain("Iteration: Schema.NullOr(issueIterationSchema)");
    expect(issueListModule).toContain("IssueTypeDetail: Schema.NullOr(issueTypeDetailSchema)");
    expect(issueListModule).toContain(
      "export type IssueListItem = Schema.Schema.Type<typeof issueListItemSchema>;",
    );
  });

  it("recursively expands unknown component refs into local helper schemas", async () => {
    const {
      extractComponentManifest,
      loadOpenApiDocument,
      renderSharedSchemaModule,
      resolveFromRepo,
    } = await import("../../scripts/codegen/shared.mjs");

    const document = await loadOpenApiDocument(resolveFromRepo(".ref/document.yaml"));
    const manifest = extractComponentManifest(document);
    const serviceHookPageComponent = manifest.find(
      (entry) => entry.componentName === "ServiceHookPage",
    );

    expect(serviceHookPageComponent).toBeDefined();

    if (serviceHookPageComponent == null) {
      throw new Error("Expected ServiceHookPage to exist in the component manifest.");
    }

    const outputPath = path.join(
      resolveFromRepo("scripts/codegen/out"),
      serviceHookPageComponent.generatedFileName,
    );
    const moduleText = renderSharedSchemaModule(
      serviceHookPageComponent,
      outputPath,
      manifest,
    );

    expect(moduleText).toContain("const serviceHookUserSchema = Schema.Struct({");
    expect(moduleText).toContain("const serviceHookSchema = Schema.Struct({");
    expect(moduleText).toContain("CreatorByUser: serviceHookUserSchema");
    expect(moduleText).toContain("UpdatedByUser: serviceHookUserSchema");
    expect(moduleText).toContain("ServiceHook: Schema.Array(serviceHookSchema)");
    expect(moduleText).toContain(
      "export const serviceHookPageSchema = Schema.Struct({",
    );
  });
});