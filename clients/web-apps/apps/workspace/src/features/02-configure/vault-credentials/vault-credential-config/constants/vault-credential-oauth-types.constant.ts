import catalog from "./corsair-integration-catalog.json";

const OAUTH_CONFIGURED_TYPES = new Set(
  catalog
    .filter((integration) => integration.oauthConfig)
    .map((integration) => integration.vaultCredentialType),
);

/**
 * Credential types that require OAuth consent after the credential is saved:
 * providers whose default sign-in method is OAuth and that ship OAuth app settings.
 * Keep this in sync with the backend's MapVaultCredentialTypeToCorsairOAuthPlugin
 * mapping and the Corsair sidecar plugin registry.
 */
export const OAUTH_CREDENTIAL_TYPES: Set<string> = new Set(
  catalog
    .filter(
      (integration) =>
        integration.defaultAuthMode === "oauth_2" &&
        OAUTH_CONFIGURED_TYPES.has(integration.vaultCredentialType),
    )
    .map((integration) => integration.vaultCredentialType),
);

/**
 * Returns true when the given credential type triggers an OAuth consent popup.
 */
export function isOAuthCredentialType(type: string | undefined): boolean {
  return Boolean(type && OAUTH_CREDENTIAL_TYPES.has(type));
}
