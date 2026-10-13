import { ModelCapabilityEnum } from "../enums/model-capability-enum";

/** A single enabled model for a tenant, including its provider and capability. */
export interface TenantEnabledModelDto {
  /** The type of the external model provider. */
  providerType: string;

  /** The identifier of the enabled model. */
  modelId: string;

  /** The capability the model is enabled for. */
  capability: ModelCapabilityEnum | null;
}
