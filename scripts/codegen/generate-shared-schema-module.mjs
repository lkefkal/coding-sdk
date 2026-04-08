import path from "node:path";

import {
  defaultDocumentPath,
  extractComponentManifest,
  loadOpenApiDocument,
  renderSchemaMigrationGuide,
  renderSharedSchemaModule,
  resolveTempSchemaOutputPath,
  resolveFromRepo,
  writeTextFile,
} from "./shared.mjs";

/**
 * 读取命令行参数中的指定选项值。
 *
 * @param argv 命令行参数数组。
 * @param name 选项名称。
 * @returns 选项对应的值；如果不存在则返回 undefined。
 */
function readOption(argv, name) {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

/**
 * 根据 OpenAPI 文档生成单个共享 schema 模块。
 *
 * @returns 生成任务完成后的 Promise。
 * @throws {TypeError} 当缺少必填 component 参数时抛出。
 * @throws {Error} 当 component 在 OpenAPI 文档中不存在时抛出。
 */
async function main() {
  const argv = process.argv.slice(2);
  const componentName = readOption(argv, "--component");
  const documentPath = readOption(argv, "--document");
  const outputPath = readOption(argv, "--output");
  const target = readOption(argv, "--target");

  if (componentName == null || componentName.length === 0) {
    throw new TypeError("Missing required --component <ComponentName> argument.");
  }

  if (target != null && target !== "out") {
    throw new RangeError("当前仅支持输出到临时目录 scripts/codegen/out；请不要再使用 src-generated。");
  }

  const document = await loadOpenApiDocument(
    documentPath != null ? resolveFromRepo(documentPath) : defaultDocumentPath,
  );
  const manifest = extractComponentManifest(document);
  const entry = manifest.find((item) => item.componentName === componentName);

  if (entry == null) {
    throw new Error(`Component ${componentName} was not found in the OpenAPI document.`);
  }

  const resolvedOutputPath =
    outputPath != null
      ? resolveFromRepo(outputPath)
      : resolveTempSchemaOutputPath(entry);

  const content = renderSharedSchemaModule(entry, resolvedOutputPath, manifest);
  const migrationGuide = renderSchemaMigrationGuide(entry, resolvedOutputPath);

  if (outputPath != null) {
    await writeTextFile(resolvedOutputPath, `${content}\n`);
    process.stdout.write(`已生成 ${componentName} 临时 schema 骨架：${outputPath}\n${migrationGuide}\n`);
  } else {
    await writeTextFile(resolvedOutputPath, `${content}\n`);
    process.stdout.write(`已生成 ${componentName} 临时 schema 骨架：${resolvedOutputPath}\n${migrationGuide}\n`);
  }
}

await main();