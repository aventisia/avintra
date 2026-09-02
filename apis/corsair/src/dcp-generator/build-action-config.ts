/**
 * Builds a per-action Cloud Connector config JSON in the standard Studio
 * Cloud Connector shape. No extra top-level properties are emitted.
 */
import type { ActionConfig, CorsairActionInvocation, DcpField, PluginMetadata } from "./types.js";
import { corsairSchemaToDcpFields } from "./schema-to-fields.js";

/** Convert a dotted Corsair action path into a PascalCase action segment. */
export function actionToPascal(action: string): string {
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
  return {
    direction: "Input",
    type: "credentials-select",
    name: `__CredentialName__${label}`,
    label: `${label} Credential`,
    description: `Select ${label} credentials used to authenticate the request.`,
    defaultValue: "",
  };
}

/**
 * Build a single action config from a Corsair tool descriptor.
 *
 * @param plugin      normalized plugin metadata
 * @param action      dotted action path passed to the sidecar (e.g. "issues.list")
 * @param nodeAction  dotted action path used to build the Studio node name
 *                    (e.g. "api.issues.list"). Defaults to <paramref name="action"/>.
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
  nodeAction?: string,
): { config: ActionConfig; invocation: CorsairActionInvocation } {
  const nodeName = actionToNodeName(plugin.id, nodeAction ?? action);

  const inputFields = corsairSchemaToDcpFields(input, "Input");
  const outputFields = buildOutputFields();

  const credentialField = buildCredentialField(plugin);

  const config: ActionConfig = {
    name: nodeName,
    description: description || actionToLabel(action),
    version: "1.0.0",
    author: "@aventisia",
    supportedPlatforms: ["cloud"],
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
