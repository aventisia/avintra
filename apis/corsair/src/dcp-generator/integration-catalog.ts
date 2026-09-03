import type { PluginMetadata } from "./types.js";
import type { DcpField } from "./types.js";

export type CorsairIntegrationCatalogEntry = {
  pluginId: string;
  pluginIds: string[];
  providerName: string;
  authModes: PluginMetadata["authModes"];
  defaultAuthMode: string;
  oauthConfig?: PluginMetadata["oauthConfig"];
  icon: string;
  vaultType: string;
  configFile: string;
};

export type VaultConfig = {
  vaultType: string;
  fields: DcpField[];
};

const LEGACY_VAULT_ALIASES: Record<string, string> = {
  github: "GitHub",
  openai: "OpenAI",
  outlook: "M365",
  gemini: "GoogleGemini",
  twilio: "Twilio",
  resend: "SendGrid",
  anthropicadministrator: "Anthropic",
};

const GOOGLE_WORKSPACE_PLUGINS = new Set([
  "gmail",
  "googleaddressvalidation",
  "googlebigquery",
  "googlecalendar",
  "googlecloudvision",
  "googledocs",
  "googledrive",
  "googlemaps",
  "googlemeet",
  "googlesheets",
]);

function titleCase(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

function fieldLabel(field: string): string {
  return field.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (value) => value.toUpperCase());
}

function getVaultType(pluginId: string): string {
  if (GOOGLE_WORKSPACE_PLUGINS.has(pluginId)) return "GoogleWorkspace";
  return LEGACY_VAULT_ALIASES[pluginId] ?? titleCase(pluginId);
}

/** Build the generated source of truth used by vault and backend consumers. */
export function buildIntegrationCatalog(
  pluginMetas: readonly PluginMetadata[],
): CorsairIntegrationCatalogEntry[] {
  const entries = pluginMetas.map((meta) => {
    const vaultType = getVaultType(meta.id);
    const pluginIds = GOOGLE_WORKSPACE_PLUGINS.has(meta.id)
      ? [...GOOGLE_WORKSPACE_PLUGINS].sort()
      : [meta.id];

    return {
      pluginId: meta.id,
      pluginIds,
      providerName: meta.providerName,
      authModes: meta.authModes,
      defaultAuthMode: meta.authType,
      oauthConfig: meta.oauthConfig,
      icon: meta.img ?? "/function.png",
      vaultType,
      configFile: `${vaultType}.json`,
    };
  });

  return entries.sort((left, right) => left.pluginId.localeCompare(right.pluginId));
}

/** Build one generic vault form for each generated credential type. */
export function buildVaultConfigs(
  entries: readonly CorsairIntegrationCatalogEntry[],
): VaultConfig[] {
  const fieldsByVaultType = new Map<string, DcpField[]>();

  for (const entry of entries) {
    const fields = fieldsByVaultType.get(entry.vaultType) ?? [];
    const declaredFields = entry.authModes.flatMap(({ accountFields }) => accountFields);
    const fieldNames = entry.defaultAuthMode === "oauth_2"
      ? ["ClientId", "ClientSecret"]
      : declaredFields.length > 0
        ? declaredFields
        : entry.defaultAuthMode === "none"
          ? []
          : ["ApiKey"];

    for (const name of fieldNames) {
      if (fields.some((field) => field.name === name)) continue;
      fields.push({
        direction: "Input",
        type: name.toLowerCase().includes("secret") || name.toLowerCase().includes("key")
          ? "password"
          : "text",
        name,
        label: fieldLabel(name),
        description: `${fieldLabel(name)} for ${entry.providerName}.`,
        defaultValue: "",
        required: true,
      });
    }

    fieldsByVaultType.set(entry.vaultType, fields);
  }

  return [...fieldsByVaultType.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([vaultType, fields]) => ({ vaultType, fields }));
}