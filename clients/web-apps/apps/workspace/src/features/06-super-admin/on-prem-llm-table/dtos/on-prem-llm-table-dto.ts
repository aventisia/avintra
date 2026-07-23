import { OnPremModelProviderEnum } from "../enums/on-prem-model-proivder-enum";
import { OnPremModelStatusEnum } from "../enums/on-prem-model-status-enum";

export interface OnPremModelDto {
  /** Unique identifier for the OnPrem model */
  id: string;

  /** Type or category of the model provider */
  providerType: OnPremModelProviderEnum;

  /** URL or endpoint used to access the model */
  providerUrl: string;

  /** Display name of the model */
  name: string;

  /** System-specific name of the model */
  modelName: string;

  /** Brief description of the model */
  description?: string | null;

  /** Current installation status of the model */
  status: OnPremModelStatusEnum;

  /**
   * Indicates whether the model is disabled.
   */
  isDisabled?: boolean | null;

  /** Username of the user who created the model */
  createdBy?: string | null;

  /** Creation timestamp */
  createdOn?: Date | string | null;

  /** Username of the last modifier */
  lastModifiedBy?: string | null;

  /** Last modification timestamp */
  lastModifiedOn?: Date | string | null;
}
