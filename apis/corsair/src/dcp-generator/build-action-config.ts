/**
 * Builds a per-action Cloud Connector config JSON in the standard Studio
 * Cloud Connector shape. No extra top-level properties are emitted.
 */
import type { ActionConfig, CorsairActionInvocation, DcpField, PluginMetadata } from "./types.js";
import { corsairSchemaToDcpFields } from "./schema-to-fields.js";
import { resolveNodeDescription, resolveNodeFieldMapping } from "./node-field-mappings/resolve.js";

/** Convert a dotted Corsair action path into a PascalCase action segment. */
function actionToPascal(action: string): string {
  return action
    .split(".")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

/**
 * Build the full Cloud Connector node name.
 * Format: "Corsair/<Plugin>/<PascalAction>Connector"
 * The trailing "Connector" is required so Studio's `endsWith("Connector")`
 * loader treats it as a Cloud Connector config.
 */
export function actionToNodeName(plugin: string, action: string): string {
  return `Corsair/${plugin.charAt(0).toUpperCase() + plugin.slice(1)}/${actionToPascal(action)}Connector`;
}

/** Convert a dotted action into a human label (fallback when no description). */
export function actionToLabel(action: string): string {
  return action
    .split(".")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    // Split camelCase segments into space-separated words, e.g.
    // "GetServiceTime" -> "Get Service Time".
    .map((p) => p.replace(/([a-z0-9])([A-Z])/g, "$1 $2"))
    .join(" ")
    // Add a colon after the first word, e.g. "Application: Get Service Time".
    .replace(/^(\S+)(\s)/, "$1: ");
}

/** Build the credential-select field for a plugin. */
function buildCredentialField(plugin: PluginMetadata): DcpField {
  const label = plugin.providerName;
  // The field name must be the canonical in-house credential type (VaultCredentialTypesEnum-compatible)
  // so the Studio selector can filter via /vault-credential/option-to-select?type=<vaultCredentialType>.
  // The visible label stays friendly (providerName).
  const credentialType = plugin.vaultCredentialType;
  return {
    direction: "Input",
    type: "credentials-select",
    name: `__CredentialName__${credentialType}`,
    label: `${label} Credential`,
    description: `Select ${label} credentials used to authenticate the request.`,
    defaultValue: "",
  };
}

/**
 * Build a single action config from a Corsair tool descriptor.
 *
 * IMPORTANT NOTE: the Studio node name is derived from `action` alone so it
 * stays identical to the node name used when resolving overrides in the action
 * selector and OpenAPI spec builders. Do not introduce a separate node path.
 *
 * @param plugin      normalized plugin metadata
 * @param action      dotted action path passed to the sidecar (e.g. "issues.list")
 * @param description action description (from endpointMeta or schema)
 * @param input       Corsair input schema
 * @param output      Corsair output schema
 * @returns the Studio DCP config plus a separate backend invocation record
 */
export function buildActionConfig(
  plugin: PluginMetadata,
  action: string,
  description: string,
  input: any,
  output: any,
): { config: ActionConfig; invocation: CorsairActionInvocation } {
  const nodeName = actionToNodeName(plugin.id, action);

  // Resolve optional hand/AI-authored field + node (command) overrides.
  const { nodeOverride, fieldMetadata } = resolveNodeFieldMapping(
    plugin.nodeFieldMapping,
    nodeName,
  );

  const inputFields = corsairSchemaToDcpFields(input, "Input", "", fieldMetadata);
  const outputFields = buildOutputFields();

  const credentialField = buildCredentialField(plugin);

  const config: ActionConfig = {
    name: nodeName,
    description: resolveNodeDescription(nodeOverride, description, actionToLabel(action)),
    version: "1.0.0",
    author: "@aventisia",
    // Runtime is a platform-agnostic backend call (ProcessCorsairRequestNode), so desktop can run it too.
    supportedPlatforms: ["cloud", "windows"],
    errorHandling: "standard",
    testScreenType: "standard",
    fields: [credentialField, ...inputFields, ...outputFields],
  };

  const invocation: CorsairActionInvocation = {
    nodeName,
    plugin: plugin.id,
    action,
    authType: plugin.authType,
    configKeys: inputFields
      .filter((f) => !f.name.startsWith("__CredentialName__"))
      .map((f) => f.name),
  };

  return { config, invocation };
}

/** Standard Cloud Connector output field shape. */
function buildOutputFields(): DcpField[] {
  return [
    {
      direction: "Output",
      type: "config-panel-output",
      name: "Result",
      label: "Result",
      description: "Returns the response data from the connector.",
      defaultValue: { value: "Result", enabled: true },
    },
  ];
}
