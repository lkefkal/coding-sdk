import { extractActionManifest, loadOpenApiDocument, resolveFromRepo, writeTextFile } from "./shared.mjs";

function readOption(argv, name) {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

const argv = process.argv.slice(2);
const documentPath = readOption(argv, "--document");
const outputPath = readOption(argv, "--output");
const actionFilter = readOption(argv, "--action");

const document = await loadOpenApiDocument(
  documentPath != null ? resolveFromRepo(documentPath) : undefined,
);
const manifest = extractActionManifest(document);
const filtered =
  actionFilter != null
    ? manifest.filter((entry) => entry.action === actionFilter)
    : manifest;
const json = `${JSON.stringify(filtered, null, 2)}\n`;

if (outputPath != null) {
  await writeTextFile(resolveFromRepo(outputPath), json);
  process.stdout.write(`wrote ${filtered.length} action entries to ${outputPath}\n`);
} else {
  process.stdout.write(json);
}