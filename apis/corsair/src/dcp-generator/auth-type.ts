/**
 * Derives a plugin's real default auth mode: the runtime default, then the
 * first declared auth mode, then "none".
 *
 * Shared by the catalog generator and the sidecar's OAuth admission so the two
 * cannot disagree about which plugins default to OAuth.
 */
export function deriveDefaultAuthType(plugin: {
  options?: { authType?: string };
  authConfig?: Record<string, unknown>;
}): string {
  const firstDeclaredMode = Object.keys(plugin.authConfig ?? {})[0];
  return plugin.options?.authType ?? firstDeclaredMode ?? "none";
}
