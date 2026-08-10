import { VaultAppsEnum } from "@/features/02-configure/vault-table/enums/vault-apps-enum";
import { vaultAppIconMapper } from "@/features/02-configure/vault-table/vault-config/constants/vault-app-icon-mapper";

import { ModelProviderEnum } from "../enums/model-provider-enum";

/**
 * Metadata describing a single model provider card in the Model Providers section.
 */
export interface ModelProviderDefinition {
  /** Backend provider type value (matches LLMProviderTypesEnum). */
  value: ModelProviderEnum;

  /** Display name shown on the card. */
  label: string;

  /** The vault (AppSecret) enum used to resolve the brand icon and filter credentials. */
  vaultType: VaultAppsEnum;

  /** Short description shown on the card. */
  description: string;

  /**
   * Whether this provider uses a self-hosted URL (e.g. Ollama) instead of a vault
   * credential. Such providers are configured via a URL + on-prem model flow.
   */
  isUrlBased?: boolean;
}

/** Base URL prefix used to render brand assets (same as the vault). */
const basePath = import.meta.env.VITE_WORKSPACE_PATH.replace(/\/$/, "");

/**
 * Resolves the brand icon for a provider.
 * URL-based providers (e.g. Ollama) use a dedicated brand asset; others use the
 * same vault icon mapper the vault uses.
 */
export const getProviderIcon = (provider: ModelProviderDefinition): string => {
  if (provider.isUrlBased) {
    // URL-based providers (e.g. Ollama) use a dedicated brand asset (.webp).
    return `${basePath}/brand-img/${provider.value.toLowerCase()}.webp`;
  }
  return `${basePath}${vaultAppIconMapper[provider.vaultType]}`;
};

/**
 * Returns whether the given provider uses a self-hosted URL instead of a vault credential.
 */
export const isUrlBasedProvider = (providerType: ModelProviderEnum): boolean =>
  modelProviderDefinitions.find((p) => p.value === providerType)?.isUrlBased ?? false;

/** Registry of the five model providers rendered in the section. */
export const modelProviderDefinitions: ModelProviderDefinition[] = [
  {
    value: ModelProviderEnum.OpenAI,
    label: "OpenAI",
    vaultType: VaultAppsEnum.OpenAI,
    description: "Enable OpenAI models such as GPT and embedding models.",
  },
  {
    value: ModelProviderEnum.Anthropic,
    label: "Anthropic",
    vaultType: VaultAppsEnum.Anthropic,
    description: "Enable Anthropic Claude models.",
  },
  {
    value: ModelProviderEnum.Google,
    label: "Google",
    vaultType: VaultAppsEnum.GoogleGemini,
    description: "Enable Google Gemini models.",
  },
  {
    value: ModelProviderEnum.OpenRouter,
    label: "OpenRouter",
    vaultType: VaultAppsEnum.OpenRouter,
    description: "Enable models aggregated through OpenRouter.",
  },
  {
    value: ModelProviderEnum.ElevenLabs,
    label: "ElevenLabs",
    vaultType: VaultAppsEnum.ElevenLabs,
    description: "Enable ElevenLabs speech and audio models.",
  },
  {
    value: ModelProviderEnum.Ollama,
    label: "Ollama On-prem",
    vaultType: VaultAppsEnum.Ollama,
    description: "Connect to a self-hosted Ollama server to use its local models.",
    isUrlBased: true,
  },
  {
    value: ModelProviderEnum.OllamaCloud,
    label: "Ollama Cloud",
    vaultType: VaultAppsEnum.OllamaCloud,
    description: "Connect to Ollama Cloud to use its hosted models.",
  },
];

/**
 * Maps a provider type to the vault (AppSecret) type string name used by
 * the app-secret API query (`?type=...`), e.g. "OpenAI", "GoogleGemini".
 */
export const getVaultTypeForProvider = (providerType: ModelProviderEnum): string =>
  VaultAppsEnum[
    modelProviderDefinitions.find((p) => p.value === providerType)?.vaultType ??
      VaultAppsEnum.GeneralCredentials
  ];
