import { ModelProviderEnum } from "@avplatform/ui/enums";

import { type ProviderLiteral } from "@/features/dynamic-config-panel/dtos/llm-providers-dto";

/**
 * A fixed model option offered by the custom UI builder.
 */
export type UiBuilderModelOption = {
  /** Wire provider sent to the LLM pipeline. */
  provider: Extract<ProviderLiteral, "openai" | "googlegemini">;
  /** Model id sent to the LLM pipeline. */
  model: string;
  /** Human-readable label shown in the model switcher. */
  label: string;
  /** Tenant enabled-model provider type used for gating. */
  providerType: ModelProviderEnum;
};

/** The two models the custom UI builder is wired to. */
export const UI_BUILDER_MODELS: UiBuilderModelOption[] = [
  {
    provider: "openai",
    model: "gpt-4o-mini",
    label: "GPT-4o mini",
    providerType: ModelProviderEnum.OpenAI,
  },
  {
    provider: "googlegemini",
    model: "gemini-3.1-flash-lite",
    label: "Gemini 3.1 Flash Lite",
    providerType: ModelProviderEnum.Google,
  },
];

/** Default model selected when the builder opens. */
export const DEFAULT_UI_BUILDER_MODEL = "gpt-4o-mini";

/** Reason shown for a model the tenant has not enabled. */
export const UI_BUILDER_MODEL_DISABLED_REASON = "Not enabled for this tenant";

/** Message shown when neither model is enabled for the tenant. */
export const UI_BUILDER_NO_MODEL_MESSAGE =
  "No supported model is enabled for this tenant. Enable GPT-4o mini or Gemini 3.1 Flash Lite to generate a UI.";
