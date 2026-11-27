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
  vaultCredentialType: string;
  configFile: string;
};

export type VaultCredentialConfig = {
  vaultCredentialType: string;
  fields: DcpField[];
};

const LEGACY_VAULT_CREDENTIAL_ALIASES: Record<string, string> = {
  github: "GitHub",
  openai: "OpenAI",
  outlook: "M365",
  teams: "M365",
  onedrive: "M365",
  sharepoint: "M365",
  gemini: "GoogleGemini",
  twilio: "Twilio",
  resend: "SendGrid",
  sendgrid: "SendGrid",
  openrouter: "OpenRouter",
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

const M365_PLUGINS = new Set(["outlook", "teams", "onedrive", "sharepoint"]);

/**
 * Vault credential types whose forms are owned by the platform: the hand-authored
 * shared/special forms (M365, Google Workspace, Salesforce, Twilio, SendGrid) and
 * the LiteLLM model-provider types that also appear in the Corsair catalog. The
 * catalog generator never creates or rewrites these forms.
 */
export const PLATFORM_OWNED_VAULT_CREDENTIAL_TYPES = new Set([
  "M365",
  "GoogleWorkspace",
  "Salesforce",
  "Twilio",
  "SendGrid",
  "OpenAI",
  "GoogleGemini",
  "Anthropic",
  "Ollama",
  "GitHub",
  "OpenRouter",
  "Cloudflare",
  "Cursor",
  "Databricks",
  "Datarobot",
  "Deepseek",
  "Huggingface",
]);

export function isPlatformOwnedVaultCredentialType(vaultCredentialType: string): boolean {
  return PLATFORM_OWNED_VAULT_CREDENTIAL_TYPES.has(vaultCredentialType);
}

function titleCase(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

function fieldLabel(field: string): string {
  return field.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (value) => value.toUpperCase());
}

export function getVaultCredentialType(pluginId: string): string {
  if (GOOGLE_WORKSPACE_PLUGINS.has(pluginId)) return "GoogleWorkspace";
  return LEGACY_VAULT_CREDENTIAL_ALIASES[pluginId] ?? titleCase(pluginId);
}

/** Build the generated source of truth used by vault credential and backend consumers. */
export function buildIntegrationCatalog(
  pluginMetas: readonly PluginMetadata[],
): CorsairIntegrationCatalogEntry[] {
  const m365Scopes = [...new Set(
    pluginMetas
      .filter((meta) => M365_PLUGINS.has(meta.id))
      .flatMap((meta) => meta.oauthConfig?.scopes ?? []),
  )].sort();

  const entries = pluginMetas.map((meta) => {
    const vaultCredentialType = getVaultCredentialType(meta.id);
    const pluginIds = GOOGLE_WORKSPACE_PLUGINS.has(meta.id)
      ? [...GOOGLE_WORKSPACE_PLUGINS].sort()
      : M365_PLUGINS.has(meta.id)
        ? [...M365_PLUGINS].sort()
      : [meta.id];

    return {
      pluginId: meta.id,
      pluginIds,
      providerName: meta.providerName,
      authModes: meta.authModes,
      defaultAuthMode: meta.authType,
      oauthConfig: M365_PLUGINS.has(meta.id) && meta.oauthConfig
        ? { ...meta.oauthConfig, scopes: m365Scopes }
        : meta.oauthConfig,
      icon: meta.img ?? "/function.png",
      vaultCredentialType,
      configFile: `${vaultCredentialType}.json`,
    };
  });

  return entries.sort((left, right) => left.pluginId.localeCompare(right.pluginId));
}

/** Build one generic vault credential form for each generated credential type. */
export function buildVaultCredentialConfigs(
  entries: readonly CorsairIntegrationCatalogEntry[],
): VaultCredentialConfig[] {
  const fieldsByVaultCredentialType = new Map<string, DcpField[]>();

  for (const entry of entries) {
    const fields = fieldsByVaultCredentialType.get(entry.vaultCredentialType) ?? [];
    const fieldNames = buildFieldNames(entry);

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

    fieldsByVaultCredentialType.set(entry.vaultCredentialType, fields);
  }

  return [...fieldsByVaultCredentialType.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([vaultCredentialType, fields]) => ({ vaultCredentialType, fields }));
}

const CLIENT_ID_FIELD_NAMES = new Set(["clientid", "clientsecret"]);

function normalizeFieldName(name: string): string {
  return name.replaceAll("_", "").toLowerCase();
}

function buildFieldNames(entry: CorsairIntegrationCatalogEntry): string[] {
  const declaredFields = entry.authModes
    .flatMap(({ accountFields }) => accountFields)
    .filter((name) => normalizeFieldName(name) !== "one")
    .filter((name) => !CLIENT_ID_FIELD_NAMES.has(normalizeFieldName(name)));

  if (entry.defaultAuthMode === "oauth_2") {
    return ["ClientId", "ClientSecret"];
  }
  if (entry.defaultAuthMode === "none" || entry.defaultAuthMode === "managed") {
    return declaredFields;
  }

  const keyFieldName = entry.defaultAuthMode === "api_key" ? "ApiKey" : entry.defaultAuthMode;
  const seen = new Set<string>([normalizeFieldName(keyFieldName)]);
  const fieldNames = [keyFieldName];
  for (const name of declaredFields) {
    const key = normalizeFieldName(name);
    if (seen.has(key)) continue;
    seen.add(key);
    fieldNames.push(name);
  }
  return fieldNames;
}

/** True when an existing form collects the fields its default auth mode needs. */
export function formSatisfiesDefaultAuthMode(
  entry: CorsairIntegrationCatalogEntry,
  inputFieldNames: readonly string[],
): boolean {
  if (isPlatformOwnedVaultCredentialType(entry.vaultCredentialType)) return true;

  const names = new Set(inputFieldNames.map(normalizeFieldName));
  const hasPlaceholder = names.has("one");
  const hasClientIdFields = [...CLIENT_ID_FIELD_NAMES].some((name) => names.has(name));

  if (entry.defaultAuthMode === "oauth_2") {
    return !hasPlaceholder && [...CLIENT_ID_FIELD_NAMES].every((name) => names.has(name));
  }
  if (entry.defaultAuthMode === "none" || entry.defaultAuthMode === "managed") {
    return !hasPlaceholder;
  }
  if (hasPlaceholder || hasClientIdFields) return false;

  // The GitHub plugin reads `api_key`; its form keeps the personal access token field.
  if (entry.pluginId === "github") {
    return names.has("apikey") || names.has("accesstoken");
  }
  return names.has(normalizeFieldName(entry.defaultAuthMode === "api_key" ? "ApiKey" : entry.defaultAuthMode));
}
