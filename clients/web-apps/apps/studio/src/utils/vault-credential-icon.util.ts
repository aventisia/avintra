import { getProviderBrandIcon } from "./provider-brand-icons.util";
import { resolveAssetSrc } from "./resolve-asset-src.util";

const DEFAULT_CREDENTIAL_ICON = "/brand-img/default-provider.svg";

const CREDENTIAL_TYPE_ICONS: Record<string, string> = {
  CustomApiTool: DEFAULT_CREDENTIAL_ICON,
};

const basePath = import.meta.env.VITE_STUDIO_PATH?.replace(/\/$/, "") ?? "";

/**
 * Resolves the icon for a vault credential select, preferring an explicit asset such as a tool icon.
 */
export function getVaultCredentialIconSrc(
  credentialType: string | undefined,
  overrideIcon?: string,
): string {
  const icon =
    overrideIcon ??
    getProviderBrandIcon(credentialType?.toLowerCase()) ??
    CREDENTIAL_TYPE_ICONS[credentialType ?? ""] ??
    DEFAULT_CREDENTIAL_ICON;
  return resolveAssetSrc(icon, basePath) ?? `${basePath}${DEFAULT_CREDENTIAL_ICON}`;
}
