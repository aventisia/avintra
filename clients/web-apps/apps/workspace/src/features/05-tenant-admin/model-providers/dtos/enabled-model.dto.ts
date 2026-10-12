import { ModelCapabilityEnum } from "../enums/model-capability-enum";
import { ModelProviderEnum } from "../enums/model-provider-enum";

/** A model enabled for a provider together with its optional capability. */
export interface EnabledModelDto {
  /** The identifier of the enabled model. */
  modelId: string;

  /** The capability the model is enabled for. */
  capability: ModelCapabilityEnum | null;
}

/** A single enabled model for a tenant, including its provider and capability. */
export interface TenantEnabledModelDto {
  /** The type of the external model provider. */
  providerType: ModelProviderEnum;

  /** The identifier of the enabled model. */
  modelId: string;

  /** The capability the model is enabled for. */
  capability: ModelCapabilityEnum | null;
}
