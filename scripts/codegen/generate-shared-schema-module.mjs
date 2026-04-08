import path from "node:path";

import {
  defaultDocumentPath,
  extractComponentManifest,
  loadOpenApiDocument,
  renderSharedSchemaModule,
  repoRoot,
  resolveFromRepo,
  writeTextFile,
} from "./shared.mjs";

function readOption(argv, name) {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

const argv = process.argv.slice(2);
const componentName = readOption(argv, "--component");
const documentPath = readOption(argv, "--document");
const outputPath = readOption(argv, "--output");

if (componentName == null || componentName.length === 0) {
  throw new TypeError("Missing required --component <ComponentName> argument.");
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
    : path.join(repoRoot, "scripts", "codegen", "out", entry.generatedFileName);

const content = renderSharedSchemaModule(entry, resolvedOutputPath, manifest);

if (outputPath != null) {
  await writeTextFile(resolvedOutputPath, `${content}\n`);
  process.stdout.write(`wrote shared schema scaffold for ${componentName} to ${outputPath}\n`);
} else {
  process.stdout.write(`${content}\n`);
}