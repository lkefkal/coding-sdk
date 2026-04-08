export interface ActionFieldKind {
  readonly kind: string;
  readonly ref?: string;
  readonly itemType?: string;
  readonly values?: readonly unknown[];
}

export interface ActionField {
  readonly description?: string;
  readonly kind: ActionFieldKind;
  readonly name: string;
  readonly nullable: boolean;
  readonly required: boolean;
}

export interface ActionManifestEntry {
  readonly action: string;
  readonly actionPlacement: "body" | "query" | "both";
  readonly category?: string;
  readonly description?: string;
  readonly fileName: string;
  readonly hasAuthorizationHeader: boolean;
  readonly method: string;
  readonly path: string;
  readonly requestFields: readonly ActionField[];
  readonly responseFields: readonly ActionField[];
  readonly summary?: string;
  readonly tag?: unknown;
  readonly timeoutMs?: number;
}

export interface ComponentManifestEntry {
  readonly componentName: string;
  readonly description?: string;
  readonly exportName: string;
  readonly fields: readonly ActionField[];
  readonly generatedFileName: string;
  readonly ref: string;
  readonly sourceFilePath?: string;
  readonly typeName: string;
}

export const repoRoot: string;
export const defaultDocumentPath: string;

export function loadOpenApiDocument(documentPath?: string): Promise<unknown>;
export function extractActionManifest(document: unknown): ActionManifestEntry[];
export function extractComponentManifest(document: unknown): ComponentManifestEntry[];
export function renderActionModule(
  entry: ActionManifestEntry,
  outputFilePath?: string,
  componentManifest?: readonly ComponentManifestEntry[],
): string;
export function renderSharedSchemaModule(
  entry: ComponentManifestEntry,
  outputFilePath?: string,
  componentManifest?: readonly ComponentManifestEntry[],
): string;
export function resolveComponentEntry(
  document: unknown,
  componentName: string,
): ComponentManifestEntry | undefined;
export function writeTextFile(outputPath: string, content: string): Promise<void>;
export function resolveFromRepo(inputPath: string): string;