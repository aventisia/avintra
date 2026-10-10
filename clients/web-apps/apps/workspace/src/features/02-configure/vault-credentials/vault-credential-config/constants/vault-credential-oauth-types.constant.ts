import { VaultCredentialAppsEnum } from "../../enums/vault-credential-apps.enum";
import catalog from "./corsair-integration-catalog.json";

/**
 * Credential types that require OAuth consent after the credential is saved.
 * Keep this in sync with the backend's MapVaultCredentialTypeToCorsairOAuthPlugin
 * mapping and the Corsair sidecar plugin registry.
 */
export const OAUTH_CREDENTIAL_TYPES: Set<string> = new Set([
  VaultCredentialAppsEnum[VaultCredentialAppsEnum.M365],
  VaultCredentialAppsEnum[VaultCredentialAppsEnum.GoogleWorkspace],
  ...catalog
    .filter((integration) => integration.authModes.some(({ mode }) => mode === "oauth_2"))
    .map((integration) => integration.vaultCredentialType),
]);

/**
 * Returns true when the given credential type triggers an OAuth consent popup.
 */
export function isOAuthCredentialType(type: string | undefined): boolean {
  return Boolean(type && OAUTH_CREDENTIAL_TYPES.has(type));
}
