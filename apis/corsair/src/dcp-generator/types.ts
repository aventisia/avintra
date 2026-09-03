/**
 * Shared types for the Corsair → Studio Cloud Connector DCP generator.
 */

/** A single Studio DCP field (dynamic-config-panel schema). */
export type DcpField = {
  direction: "Input" | "Output";
  type: string;
  name: string;
  label: string;
  description: string;
  defaultValue: unknown;
  required?: boolean;
  selectOptions?: { label: string; value: string; description: string }[];
};

/** A generated per-action Cloud Connector config file. */
export type ActionConfig = {
  name: string;
  description: string;
  version: string;
  author: string;
  supportedPlatforms: string[];
  errorHandling: string;
  testScreenType: string;
  fields: DcpField[];
};

/** Backend invocation metadata for a single Corsair action. */
export type CorsairActionInvocation = {
  /** Full node name, e.g. "Corsair/Github/ApiIssuesListConnector". */
  nodeName: string;
  /** Sidecar plugin id, e.g. "github". */
  plugin: string;
  /** Exact dotted sidecar action, e.g. "api.issues.list". */
  action: string;
  /** Auth type required by the plugin, e.g. "oauth_2" or "api_key". */
  authType: string;
  /** Node field names that are placed into the sidecar payload. */
  configKeys: string[];
};

/** A single action entry in the action-selector mapping. */
export type ActionSelectorAction = {
  type: "cloudConnectorNode";
  name: string;
  label: string;
  description: string;
  docsLink: string;
  icon: string | null;
  img: string | null;
  supportedPlatforms: string[];
};

/** An L2 action category (one per Corsair plugin). */
export type ActionSelectorCategory = {
  label: string;
  description: string;
  icon: string | null;
  img: string | null;
  listType: string | null;
  actions: ActionSelectorAction[];
  /** Visibility rules (absence = visible everywhere). */
  doNotRenderIf?: ("production" | "commercial" | "enterprise")[];
};

/** An L1 primary category (we merge into the existing "App Integrations"). */
export type ActionSelectorPrimary = {
  label: string;
  description: string;
  icon: string | null;
  img: string | null;
  actionCategories: ActionSelectorCategory[];
};

/** Authentication fields declared by a Corsair plugin. */
export type PluginAuthMode = {
  mode: string;
  accountFields: string[];
};

/** OAuth settings declared by a Corsair plugin. */
export type PluginOAuthConfig = {
  providerName?: string;
  authUrl?: string;
  tokenUrl?: string;
  scopes?: string[];
  tokenAuthMethod?: "body" | "basic";
};

/** Normalized metadata extracted from a registered Corsair plugin. */
export type PluginMetadata = {
  id: string;
  providerName: string;
  description: string;
  img: string | null;
  authType: string;
  authModes: PluginAuthMode[];
  oauthConfig?: PluginOAuthConfig;
  /** dotted action path → human-readable description (from endpointMeta). */
  actionDescriptions: Record<string, string>;
};

/** Options for the generator orchestrator. */
export type GenerateDcpOptions = {
  /** Absolute path to the Cloud Connectors ConfigFiles root. */
  outputDir: string;
  /** Corsair plugin objects (from src/corsair.ts). */
  plugins: readonly unknown[];
  /** The corsair instance used to introspect schemas in-process. */
  corsair: unknown;
  /** Icon path map: plugin id → /assets/<Icon>.svg. */
  iconMap?: Record<string, string>;
  /** Base URL map: plugin id → provider base URL (for OpenAPI specs). */
  baseUrlMap?: Record<string, string>;
  /**
   * Absolute path to the global Cloud Connector action-selector mapping file
   * (owned by the Workspace API codebase). When Corsair configs are written to
   * a shared path (CORSAIR_CONFIG_DIR), the global mapping still lives in the
   * Workspace API codebase, so the cleanup must target that file. Defaults to
   * <c>outputDir/CloudConnectorActionSelectorMappingFile.json</c>.
   */
  globalMappingFile?: string;
};
