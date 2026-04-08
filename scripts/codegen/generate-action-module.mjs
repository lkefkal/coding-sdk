import path from "node:path";

import {
  extractActionManifest,
  extractComponentManifest,
  generatedApisDir,
  isPathInside,
  loadOpenApiDocument,
  renderActionModule,
  resolveGeneratedActionOutputPath,
  resolveFromRepo,
  syncGeneratedIndex,
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
 * 根据 OpenAPI 文档生成单个 action 模块。
 *
 * @returns 生成任务完成后的 Promise。
 * @throws {TypeError} 当缺少必填 action 参数时抛出。
 * @throws {Error} 当 action 在 OpenAPI 文档中不存在时抛出。
 */
async function main() {
  const argv = process.argv.slice(2);
  const actionName = readOption(argv, "--action");
  const documentPath = readOption(argv, "--document");
  const outputPath = readOption(argv, "--output");
  const target = readOption(argv, "--target");

  if (actionName == null || actionName.length === 0) {
    throw new TypeError("Missing required --action <ActionName> argument.");
  }

  const document = await loadOpenApiDocument(
    documentPath != null ? resolveFromRepo(documentPath) : undefined,
  );
  const manifest = extractActionManifest(document);
  const componentManifest = extractComponentManifest(document);
  const entry = manifest.find((item) => item.action === actionName);

  if (entry == null) {
    throw new Error(`Action ${actionName} was not found in the OpenAPI document.`);
  }

  const resolvedOutputPath =
    outputPath != null
      ? resolveFromRepo(outputPath)
      : target === "src-generated"
        ? resolveGeneratedActionOutputPath(entry)
        : path.join(resolveFromRepo("scripts/codegen/out"), `${entry.fileName}.generated.ts`);

  const content = renderActionModule(entry, resolvedOutputPath, componentManifest);

  if (outputPath != null) {
    await writeTextFile(resolvedOutputPath, `${content}\n`);
    process.stdout.write(`wrote scaffold for ${actionName} to ${outputPath}\n`);
  } else {
    await writeTextFile(resolvedOutputPath, `${content}\n`);
    process.stdout.write(`wrote scaffold for ${actionName} to ${resolvedOutputPath}\n`);
  }

  if (isPathInside(generatedApisDir, resolvedOutputPath)) {
    await syncGeneratedIndex(generatedApisDir);
  }
}

await main();