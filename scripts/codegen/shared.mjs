import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import YAML from "yaml";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const repoRoot = path.resolve(dirname, "..", "..");
export const defaultDocumentPath = path.join(repoRoot, ".ref", "document.yaml");
const sourceClientTypesPath = path.join(repoRoot, "src", "client", "types.ts");
const sourceActionSpecPath = path.join(repoRoot, "src", "core", "actionSpec.ts");

function ensureRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value
    : {};
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function lowerFirst(value) {
  return value.length === 0 ? value : `${value[0].toLowerCase()}${value.slice(1)}`;
}

function toActionPlacement(actionDetail) {
  switch (String(actionDetail ?? "body").toLowerCase()) {
    case "all":
      return "both";
    case "query":
      return "query";
    default:
      return "body";
  }
}

function normalizeFieldKind(schema) {
  if (schema == null || typeof schema !== "object") {
    return { kind: "unknown" };
  }

  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return {
      kind: "enum",
      values: schema.enum,
    };
  }

  if ("$ref" in schema && typeof schema.$ref === "string") {
    return {
      kind: "ref",
      ref: schema.$ref,
    };
  }

  if (schema.type === "array") {
    const itemSchema = schema.items;

    if (itemSchema != null && typeof itemSchema === "object") {
      if ("$ref" in itemSchema && typeof itemSchema.$ref === "string") {
        return {
          kind: "array-ref",
          ref: itemSchema.$ref,
        };
      }

      if (typeof itemSchema.type === "string") {
        return {
          kind: "array",
          itemType: itemSchema.type,
        };
      }
    }

    return { kind: "array" };
  }

  if (typeof schema.type === "string") {
    return {
      kind: schema.type,
    };
  }

  return { kind: "unknown" };
}

function collectFields(properties, requiredValues, requiredByOutput) {
  const required = new Set([
    ...ensureArray(requiredValues).filter((value) => typeof value === "string"),
    ...ensureArray(requiredByOutput).filter((value) => typeof value === "string"),
  ]);

  return Object.entries(ensureRecord(properties)).map(([name, schema]) => {
    const record = ensureRecord(schema);

    return {
      description:
        typeof record.description === "string" ? record.description : undefined,
      kind: normalizeFieldKind(record),
      name,
      nullable: record.nullable === true,
      required: name === "RequestId" || required.has(name),
    };
  });
}

function requestSchemaOf(operation) {
  return ensureRecord(
    operation.requestBody?.content?.["application/json"]?.schema,
  );
}

function responseEnvelopeSchemaOf(operation) {
  const responseSchema = ensureRecord(
    operation.responses?.["200"]?.content?.["application/json"]?.schema,
  );

  return ensureRecord(responseSchema.properties?.Response);
}

function fallbackActionName(route) {
  const queryMatch = route.match(/[?&]action=([^&]+)/i);

  if (queryMatch?.[1] != null) {
    return queryMatch[1];
  }

  return route.replace(/^\//, "").split("?")[0] || undefined;
}

export async function loadOpenApiDocument(documentPath = defaultDocumentPath) {
  const raw = await readFile(documentPath, "utf8");
  return YAML.parse(raw);
}

export function extractActionManifest(document) {
  const manifest = [];

  for (const [route, pathItem] of Object.entries(ensureRecord(document.paths))) {
    for (const [method, operationValue] of Object.entries(ensureRecord(pathItem))) {
      const operation = ensureRecord(operationValue);
      const action =
        typeof operation.operationId === "string"
          ? operation.operationId
          : fallbackActionName(route);

      if (action == null || action.length === 0) {
        continue;
      }

      const requestSchema = requestSchemaOf(operation);
      const responseEnvelope = responseEnvelopeSchemaOf(operation);
      const actionDetail = ensureRecord(operation["x-tcapi-system-param-detail"]).Action;

      manifest.push({
        action,
        actionPlacement: toActionPlacement(actionDetail),
        category:
          typeof operation["x-tcapi-category"] === "string"
            ? operation["x-tcapi-category"]
            : undefined,
        description:
          typeof operation.description === "string" ? operation.description : undefined,
        fileName: lowerFirst(action),
        hasAuthorizationHeader: ensureArray(operation.parameters).some(
          (parameter) => ensureRecord(parameter).name === "Authorization",
        ),
        method: method.toUpperCase(),
        path: route,
        requestFields: collectFields(
          requestSchema.properties,
          requestSchema.required,
          undefined,
        ),
        responseFields: collectFields(
          responseEnvelope.properties,
          responseEnvelope.required,
          ensureRecord(
            operation.responses?.["200"]?.content?.["application/json"]?.schema,
          )["x-tcapi-output-required"],
        ),
        summary: typeof operation.summary === "string" ? operation.summary : undefined,
        tag: ensureArray(operation.tags)[0],
        timeoutMs:
          typeof operation["x-tcapi-timeout"] === "number"
            ? operation["x-tcapi-timeout"]
            : undefined,
      });
    }
  }

  return manifest.sort((left, right) => left.action.localeCompare(right.action));
}

function schemaExpressionFromField(field) {
  const base = (() => {
    switch (field.kind.kind) {
      case "enum":
        return `Schema.Literal(${field.kind.values.map((value) => JSON.stringify(value)).join(", ")})`;
      case "string":
        return "Schema.String";
      case "integer":
      case "number":
        return "Schema.Number";
      case "boolean":
        return "Schema.Boolean";
      case "array":
        switch (field.kind.itemType) {
          case "string":
            return "Schema.Array(Schema.String)";
          case "integer":
          case "number":
            return "Schema.Array(Schema.Number)";
          case "boolean":
            return "Schema.Array(Schema.Boolean)";
          default:
            return "Schema.Array(Schema.Unknown)";
        }
      case "array-ref":
        return "Schema.Array(Schema.Unknown)";
      case "ref":
      case "object":
      case "unknown":
      default:
        return "Schema.Unknown";
    }
  })();

  const nullable = field.nullable ? `Schema.NullOr(${base})` : base;
  return field.required ? nullable : `Schema.optional(${nullable})`;
}

function renderStruct(fields) {
  if (fields.length === 0) {
    return "Schema.Struct({})";
  }

  const lines = fields.map((field) => `  ${field.name}: ${schemaExpressionFromField(field)},`);
  return `Schema.Struct({\n${lines.join("\n")}\n})`;
}

function escapeText(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function toModuleSpecifier(fromFilePath, targetFilePath) {
  const relative = path.relative(path.dirname(fromFilePath), targetFilePath);
  const normalized = relative.split(path.sep).join("/").replace(/\.ts$/, ".js");
  return normalized.startsWith(".") ? normalized : `./${normalized}`;
}

export function renderActionModule(entry, outputFilePath = path.join(repoRoot, "src", "apis", "generated", `${entry.fileName}.ts`)) {
  const functionName = lowerFirst(entry.action);
  const clientTypesImport = toModuleSpecifier(outputFilePath, sourceClientTypesPath);
  const actionSpecImport = toModuleSpecifier(outputFilePath, sourceActionSpecPath);

  return [
    'import { Schema } from "effect";',
    "",
    `import type { CodingClient, InvokeOptions } from "${clientTypesImport}";`,
    `import { defineActionSpec } from "${actionSpecImport}";`,
    "",
    `export const action = "${escapeText(entry.action)}";`,
    "",
    `export const requestSchema = ${renderStruct(entry.requestFields)};`,
    "",
    `export const responseSchema = ${renderStruct(entry.responseFields)};`,
    "",
    `export type ${entry.action}Request = Schema.Schema.Type<typeof requestSchema>;`,
    "",
    `export type ${entry.action}Response = Schema.Schema.Type<typeof responseSchema>;`,
    "",
    `export const ${functionName}Spec = defineActionSpec({`,
    `  action,`,
    `  actionPlacement: "${entry.actionPlacement}",`,
    `  requestSchema,`,
    `  responseSchema,`,
    entry.summary != null ? `  summary: "${escapeText(entry.summary)}",` : undefined,
    "});",
    "",
    `export async function ${functionName}(`,
    "  client: CodingClient,",
    `  input: ${entry.action}Request,`,
    "  options?: InvokeOptions,",
    `): Promise<${entry.action}Response> {`,
    `  return client.invoke(${functionName}Spec, input, options);`,
    "}",
    "",
  ]
    .filter((line) => line != null)
    .join("\n");
}

export async function writeTextFile(outputPath, content) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, content, "utf8");
}

export function resolveFromRepo(inputPath) {
  return path.isAbsolute(inputPath) ? inputPath : path.join(repoRoot, inputPath);
}