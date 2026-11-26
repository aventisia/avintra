import { appToVaultCredentialNameMapper } from "./app-to-vault-credential-name-mapper.constant";
import catalog from "./corsair-integration-catalog.json";

type CorsairIntegration = (typeof catalog)[number];

const integrations = catalog as CorsairIntegration[];

const normalizeName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const iconByPluginId = new Map(integrations.map(({ pluginId, icon }) => [pluginId, icon]));
const iconByProviderName = new Map(
  integrations.map(({ providerName, icon }) => [normalizeName(providerName), icon]),
);

export function getCorsairIntegration(type: string | undefined): CorsairIntegration | undefined {
  return integrations.find((integration) => integration.vaultCredentialType === type);
}

export function isCorsairCredentialType(type: string | undefined): boolean {
  return Boolean(getCorsairIntegration(type));
}

export function getCorsairPluginIcon(pluginId: string | undefined): string | undefined {
  if (!pluginId) return undefined;
  return iconByPluginId.get(pluginId) ?? iconByProviderName.get(normalizeName(pluginId));
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
    ? (appToVaultCredentialNameMapper[integration.vaultCredentialType] ??
        `${integration.vaultCredentialType.toLowerCase()}_credentials`)
    : undefined;
}
