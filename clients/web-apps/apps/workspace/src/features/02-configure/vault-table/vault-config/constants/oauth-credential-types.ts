import { VaultAppsEnum } from "../../enums/vault-apps-enum";
import catalog from "./corsair-integration-catalog.json";

/**
 * Credential types that require OAuth consent after the credential is saved.
 * Keep this in sync with the backend's MapAppSecretTypeToCorsairOAuthPlugin
 * mapping and the Corsair sidecar plugin registry.
 */
export const OAUTH_CREDENTIAL_TYPES: Set<string> = new Set([
  VaultAppsEnum[VaultAppsEnum.M365],
  VaultAppsEnum[VaultAppsEnum.GoogleWorkspace],
  ...catalog
    .filter((integration) => integration.authModes.some(({ mode }) => mode === "oauth_2"))
    .map((integration) => integration.vaultType),
]);

/**
 * Returns true when the given credential type triggers an OAuth consent popup.
 */
export function isOAuthCredentialType(type: string | undefined): boolean {
  return Boolean(type && OAUTH_CREDENTIAL_TYPES.has(type));
}
