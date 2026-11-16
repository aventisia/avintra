/** LiteLLM provider names for the tenant provider types that do not follow snake_case. */
const LITELLM_PROVIDER_OVERRIDES: Record<string, string> = {
  openai: "openai",
  gemini: "gemini",
  google: "gemini",
  googlegemini: "gemini",
  anthropic: "anthropic",
  openrouter: "openrouter",
  deepinfra: "deepinfra",
  elevenlabs: "elevenlabs",
  ollama: "ollama",
  ollamacloud: "ollama_chat",
  groq: "groq",
  bedrock: "bedrock",
  mistral: "mistral",
};

const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  gemini: "Google Gemini",
  anthropic: "Anthropic",
  openrouter: "OpenRouter",
  deepinfra: "DeepInfra",
  ollama: "Ollama",
  ollama_chat: "Ollama Cloud",
  groq: "Groq",
  bedrock: "AWS Bedrock",
  mistral: "Mistral",
  azure: "Azure OpenAI",
  azure_ai: "Azure AI",
  vertex_ai: "Vertex AI",
  xai: "xAI",
  deepseek: "DeepSeek",
  together_ai: "Together AI",
  fireworks_ai: "Fireworks AI",
  cohere: "Cohere",
  perplexity: "Perplexity",
};

/** Text providers whose platform route needs an explicit output cap to avoid short defaults. */
const EXPLICIT_OUTPUT_CAP_PROVIDERS = new Set(["anthropic", "bedrock", "vertex_ai"]);

/** Output token cap sent to providers that require one. */
export const UI_BUILDER_MAX_OUTPUT_TOKENS = 16384;

const toSnakeCase = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();

/** Returns the LiteLLM provider name for a tenant model provider type. */
export const getUiBuilderLiteLlmProvider = (providerType: string) => {
  const trimmed = providerType.trim();
  const override = LITELLM_PROVIDER_OVERRIDES[trimmed.toLowerCase()];
  if (override) return override;
  return /^[a-z0-9_]+$/.test(trimmed) ? trimmed : toSnakeCase(trimmed);
};

/** Returns the display label for a tenant model provider type. */
export const getUiBuilderProviderLabel = (providerType: string) => {
  const provider = getUiBuilderLiteLlmProvider(providerType);
  return (
    PROVIDER_LABELS[provider] ??
    provider
      .split("_")
      .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
      .join(" ")
  );
};

/** Returns whether requests to the provider should carry an explicit output token cap. */
export const needsUiBuilderOutputCap = (provider: string) =>
  EXPLICIT_OUTPUT_CAP_PROVIDERS.has(provider);

/** Returns a selection key that keeps a model id distinct across providers. */
export const toUiBuilderModelKey = (providerType: string, modelId: string) =>
  `${providerType.trim().toLowerCase()}::${modelId.trim()}`;

/** Returns the model id to send: strips a catalog `provider/` prefix and a legacy `/<limit>` suffix. */
export const toUiBuilderModelId = (provider: string, modelId: string) => {
  const trimmed = modelId.trim();
  const unprefixed = trimmed.toLowerCase().startsWith(`${provider}/`)
    ? trimmed.slice(provider.length + 1)
    : trimmed;
  return unprefixed.replace(/\/\d+$/, "");
};
