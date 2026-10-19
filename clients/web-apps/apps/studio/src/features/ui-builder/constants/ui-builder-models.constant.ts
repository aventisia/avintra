import { type ProviderLiteral } from "@/features/dynamic-config-panel/dtos/llm-providers-dto";

/** Wire provider and raw model id sent to the LLM pipeline for a builder generation. */
export type UiBuilderGenerationModel = {
  /** Wire provider sent to the LLM pipeline. */
  provider: ProviderLiteral;
  /** Raw model id sent to the LLM pipeline. */
  model: string;
};

/** Reason shown for a provider or model the builder cannot route yet. */
export const UI_BUILDER_UNSUPPORTED_MODEL_REASON = "Not supported by the builder yet";

/** Message shown when the tenant has no enabled Text model. */
export const UI_BUILDER_NO_MODEL_MESSAGE =
  "No Text model is enabled for this tenant. Enable models in Tenant Admin > Models to generate a UI.";

/** Message shown when enabled Text models exist but none use a supported provider. */
export const UI_BUILDER_NO_SUPPORTED_MODEL_MESSAGE =
  "None of this tenant's enabled Text models use a provider the builder supports. Enable a supported model in Tenant Admin > Models to generate a UI.";

/** Message shown while the tenant's enabled models are loading. */
export const UI_BUILDER_MODELS_LOADING_MESSAGE = "Loading models…";

/** Message shown when the tenant's enabled models cannot be loaded. */
export const UI_BUILDER_MODELS_LOAD_FAILED_MESSAGE =
  "The tenant's enabled models could not be loaded. Reload the page to try again.";
