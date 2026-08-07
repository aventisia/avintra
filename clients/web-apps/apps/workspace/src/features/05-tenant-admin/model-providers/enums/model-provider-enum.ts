/**
 * Enum representing the model providers supported in the tenant model-provider configuration.
 * The value matches the provider type string accepted by the backend LLM provider endpoint.
 */
export enum ModelProviderEnum {
  OpenAI = "OpenAI",
  Anthropic = "Anthropic",
  Google = "Gemini",
  OpenRouter = "OpenRouter",
  ElevenLabs = "ElevenLabs",
  Ollama = "Ollama",
  OllamaCloud = "OllamaCloud",
}
