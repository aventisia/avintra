import { LLModelType } from "./ll-model.type";

export type LLMProviderType = {
  /* Value of the Provider that can be passed to llmpipeline apis */
  value: string;

  /*
   * Display name (which is officially used) of the Provider e.g., "OpenAI", "Anthropic", "Google", "OpenRouter")
   * It is optional. If label is not provided, value will be used as label by default
   */
  label: string;

  /* List of models that provider supports */
  models: LLModelType[];
};
