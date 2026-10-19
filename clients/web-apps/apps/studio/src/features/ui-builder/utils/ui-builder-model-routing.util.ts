import { type ProviderLiteral } from "@/features/dynamic-config-panel/dtos/llm-providers-dto";

/** Wire provider values the LLM pipeline can route, keyed by normalized tenant provider type. */
export const UI_BUILDER_WIRE_PROVIDERS: Record<string, ProviderLiteral> = {
  openai: "openai",
  gemini: "googlegemini",
  ollama: "ollama",
  deepinfra: "deepinfra",
  openrouter: "openrouter",
  anthropic: "anthropic",
};

const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  gemini: "Google",
  deepinfra: "DeepInfra",
  ollama: "Ollama On-prem",
  openrouter: "OpenRouter",
  anthropic: "Anthropic",
  elevenlabs: "ElevenLabs",
  ollamacloud: "Ollama Cloud",
  groq: "Groq",
  bedrock: "Bedrock",
  mistral: "Mistral",
};

const normalizeProviderType = (providerType: string) => providerType.trim().toLowerCase();

/** Returns the display label for a tenant model provider type. */
export const getUiBuilderProviderLabel = (providerType: string) =>
  PROVIDER_LABELS[normalizeProviderType(providerType)] ?? providerType.trim();

/** Returns the wire provider the LLM pipeline can route, or null when it cannot be routed. */
export const getUiBuilderWireProvider = (providerType: string): ProviderLiteral | null =>
  UI_BUILDER_WIRE_PROVIDERS[normalizeProviderType(providerType)] ?? null;

/** Returns a selection key that keeps a model id distinct across providers. */
export const toUiBuilderModelKey = (providerType: string, modelId: string) =>
  `${providerType.trim().toLowerCase()}::${modelId.trim()}`;
