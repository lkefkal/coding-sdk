import path from "node:path";

import { extractActionManifest, loadOpenApiDocument, renderActionModule, repoRoot, resolveFromRepo, writeTextFile } from "./shared.mjs";

function readOption(argv, name) {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

const argv = process.argv.slice(2);
const actionName = readOption(argv, "--action");
const documentPath = readOption(argv, "--document");
const outputPath = readOption(argv, "--output");

if (actionName == null || actionName.length === 0) {
  throw new TypeError("Missing required --action <ActionName> argument.");
}

const document = await loadOpenApiDocument(
  documentPath != null ? resolveFromRepo(documentPath) : undefined,
);
const manifest = extractActionManifest(document);
const entry = manifest.find((item) => item.action === actionName);

if (entry == null) {
  throw new Error(`Action ${actionName} was not found in the OpenAPI document.`);
}

const resolvedOutputPath =
  outputPath != null
    ? resolveFromRepo(outputPath)
    : path.join(repoRoot, "src", "apis", "generated", `${entry.fileName}.ts`);

const content = renderActionModule(entry, resolvedOutputPath);

if (outputPath != null) {
  await writeTextFile(resolvedOutputPath, `${content}\n`);
  process.stdout.write(`wrote scaffold for ${actionName} to ${outputPath}\n`);
} else {
  process.stdout.write(`${content}\n`);
}