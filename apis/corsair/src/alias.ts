/**
 * Per-credential plugin-instance ids ("aliases").
 *
 * A vault credential owns one provider-app registration, so the Corsair plugin
 * instance that carries its OAuth app settings is addressed as
 * `<base-plugin>__<credential-id>`. The base plugin object stays the source of
 * endpoints, key builders and OAuth config; the alias is a spread copy with its
 * own `id`, which gives the SDK a distinct integration row per credential.
 */

const ALIAS_SEPARATOR = "__";
const MAX_PLUGIN_ID_LENGTH = 64;
const PLUGIN_ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;

export type ParsedAliasId = {
  basePluginId: string;
  credentialId: string;
};

/** Builds the deterministic plugin-instance id for a credential. */
export function toAliasId(basePluginId: string, credentialId: string): string {
  const base = basePluginId.trim().toLowerCase();
  const suffix = credentialId.replaceAll("-", "").toLowerCase();
  const aliasId = `${base}${ALIAS_SEPARATOR}${suffix}`;
  if (aliasId.length > MAX_PLUGIN_ID_LENGTH || !PLUGIN_ID_PATTERN.test(aliasId)) {
    throw new Error(`Invalid plugin instance id: ${aliasId}`);
  }
  return aliasId;
}

/** Splits an alias id into its base plugin and credential id, or null when it is not one. */
export function parseAliasId(pluginId: string): ParsedAliasId | null {
  const normalized = pluginId.trim().toLowerCase();
  const separatorIndex = normalized.lastIndexOf(ALIAS_SEPARATOR);
  if (separatorIndex <= 0) return null;

  const basePluginId = normalized.slice(0, separatorIndex);
  const credentialId = normalized.slice(separatorIndex + ALIAS_SEPARATOR.length);
  if (!basePluginId || !/^[0-9a-f]{32}$/.test(credentialId)) return null;
  if (!PLUGIN_ID_PATTERN.test(basePluginId)) return null;
  return { basePluginId, credentialId };
}

/** True when the id addresses a per-credential plugin instance. */
export function isAliasId(pluginId: string): boolean {
  return parseAliasId(pluginId) !== null;
}
