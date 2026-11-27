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
  gemini: "GoogleGemini",
  twilio: "Twilio",
  sendgrid: "SendGrid",
  openrouter: "OpenRouter",
  anthropicadministrator: "Anthropic",
};

/** Microsoft services that keep the optional Directory (tenant) ID on their form. */
export const MICROSOFT_SERVICE_PLUGIN_IDS = new Set(["outlook", "teams", "onedrive", "sharepoint"]);

/**
 * Vault credential types whose forms are owned by the platform: the hand-authored
 * shared/special forms (Salesforce, Twilio, SendGrid) and the LiteLLM
 * model-provider types that also appear in the Corsair catalog. The catalog
 * generator never creates or rewrites these forms.
 */
export const PLATFORM_OWNED_VAULT_CREDENTIAL_TYPES = new Set([
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
  return LEGACY_VAULT_CREDENTIAL_ALIASES[pluginId] ?? titleCase(pluginId);
}

/** Build the generated source of truth used by vault credential and backend consumers. */
export function buildIntegrationCatalog(
  pluginMetas: readonly PluginMetadata[],
): CorsairIntegrationCatalogEntry[] {
  const entries = pluginMetas.map((meta) => {
    const vaultCredentialType = getVaultCredentialType(meta.id);

    return {
      pluginId: meta.id,
      pluginIds: [meta.id],
      providerName: meta.providerName,
      authModes: meta.authModes,
      defaultAuthMode: meta.authType,
      oauthConfig: meta.oauthConfig,
      icon: meta.img ?? "/function.png",
      vaultCredentialType,
      configFile: `${vaultCredentialType}.json`,
    };
  });

  return entries.sort((left, right) => left.pluginId.localeCompare(right.pluginId));
}

/** Form copy overrides for fields whose generated wording differs from the product label. */
const FORM_FIELD_OVERRIDES: Record<string, { label: string; description: string; required: boolean }> = {
  AzureTenantId: {
    label: "Directory (tenant) ID",
    description: "Directory (tenant) ID",
    required: false,
  },
};

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
      const override = FORM_FIELD_OVERRIDES[name];
      fields.push({
        direction: "Input",
        type: name.toLowerCase().includes("secret") || name.toLowerCase().includes("key")
          ? "password"
          : "text",
        name,
        label: override?.label ?? fieldLabel(name),
        description: override?.description ?? `${fieldLabel(name)} for ${entry.providerName}.`,
        defaultValue: "",
        required: override?.required ?? true,
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
    const fields = ["ClientId", "ClientSecret"];
    if (MICROSOFT_SERVICE_PLUGIN_IDS.has(entry.pluginId)) {
      fields.push("AzureTenantId");
    }
    return fields;
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
    if (hasPlaceholder || ![...CLIENT_ID_FIELD_NAMES].every((name) => names.has(name))) {
      return false;
    }
    return !MICROSOFT_SERVICE_PLUGIN_IDS.has(entry.pluginId) || names.has("azuretenantid");
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
