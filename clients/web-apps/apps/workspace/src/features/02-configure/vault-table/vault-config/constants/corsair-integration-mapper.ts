import { appToCredentialNameMapper } from "./app-to-credential-name-mapper";
import catalog from "./corsair-integration-catalog.json";

type CorsairIntegration = (typeof catalog)[number];

const integrations = catalog as CorsairIntegration[];

export function getCorsairIntegration(type: string | undefined): CorsairIntegration | undefined {
  return integrations.find((integration) => integration.vaultType === type);
}

export function isCorsairCredentialType(type: string | undefined): boolean {
  return Boolean(getCorsairIntegration(type));
}

export function getCorsairPluginIcon(pluginId: string | undefined): string | undefined {
  return integrations.find((integration) => integration.pluginId === pluginId)?.icon;
}

export function isCorsairOAuthCredentialType(type: string | undefined): boolean {
  return Boolean(
    getCorsairIntegration(type)?.authModes.some(({ mode }) => mode === "oauth_2") ||
    type === "M365" ||
    type === "GoogleWorkspace",
  );
}

export function getCorsairCredentialName(type: string | undefined): string | undefined {
  const integration = getCorsairIntegration(type);
  return integration
    ? (appToCredentialNameMapper[integration.vaultType] ??
        `${integration.vaultType.toLowerCase()}_credentials`)
    : undefined;
}
