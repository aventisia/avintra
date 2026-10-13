import { ModelCapabilityEnum } from "@avplatform/ui/enums";

/** A model enabled for a provider together with its optional capability. */
export interface EnabledModelDto {
  /** The identifier of the enabled model. */
  modelId: string;

  /** The capability the model is enabled for. */
  capability: ModelCapabilityEnum | null;
}
