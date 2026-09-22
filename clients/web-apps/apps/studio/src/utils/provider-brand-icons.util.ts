/**
 * Maps a studio model provider value to its brand icon asset.
 * Providers without a dedicated asset fall back to an equivalent brand asset.
 */
const PROVIDER_BRAND_ICONS: Record<string, string> = {
  openai: "/brand-img/openai.svg",
  googlegemini: "/brand-img/gemini.svg",
  openrouter: "/brand-img/openrouter.svg",
  anthropic: "/brand-img/anthropic.svg",
  elevenlabs: "/brand-img/elevenlabs.svg",
  groq: "/brand-img/groqcloud.svg",
  ollama: "/brand-img/ollama.svg",
  ollamacloud: "/brand-img/ollama.svg",
};

/** Returns the brand icon path for a provider value, or undefined when unknown. */
const getProviderBrandIcon = (provider?: string | null): string | undefined =>
  provider ? PROVIDER_BRAND_ICONS[provider] : undefined;

export { getProviderBrandIcon, PROVIDER_BRAND_ICONS };
