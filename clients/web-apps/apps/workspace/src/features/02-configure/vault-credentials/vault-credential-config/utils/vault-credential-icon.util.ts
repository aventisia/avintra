import { getVaultCredentialAppIcon } from "../constants/vault-credential-app-icon-mapper.constant";

const basePath = import.meta.env.VITE_WORKSPACE_PATH?.replace(/\/$/, "") || "";

/**
 * Resolves the servable brand icon URL for a vault credential type.
 */
export function getVaultCredentialIconSrc(type: string | undefined): string {
  return `${basePath}${getVaultCredentialAppIcon(type) ?? "/brand-img/default-provider.svg"}`;
}
