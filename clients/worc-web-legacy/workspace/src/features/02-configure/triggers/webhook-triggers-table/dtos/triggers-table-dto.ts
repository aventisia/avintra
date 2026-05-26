import { TriggerFrequencyTypesEnum } from "@/enums/trigger-frequency-types-enum";
import { MachineEnvironmentTypesEnum } from "@/react-toolkit/enums/machine-environment-types-enum";

/**
 * Represents a data transfer object (DTO) for a trigger.
 */
export interface TriggersTableDto {
  id?: string;
  tenantId: string;

  name: string;
  environment: MachineEnvironmentTypesEnum;
  agentIds?: string[];

  timezone: string;
  startsOn: Date;

  frequency: TriggerFrequencyTypesEnum;

  repeateAt?: Date;
  repeateOn?: string[];
  repeateEvery?: number;

  hasNonWorkingDays: boolean;
  nonWorkingDays: Date;

  hasNonWorkingTime: boolean;
  nonWorkingTimeFrom: Date;
  nonWorkingTimeTo: Date;

  isEnds: boolean;
  endsOn: Date;

  triggerForNewItem: boolean;
  triggerForNewEmail: boolean;

  scheduleAutoDisabling: boolean;
  generateStuckAlert: boolean;
  generateFailedAlert: boolean;
  /**
   * Gets or sets a flag indicating whether the trigger record is disabled.
   *
   * Not making it required because same DTO is used for insert and update.
   *
   * Its important to have this property nullable because we need to differentiate between true; false and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the trigger record. Max-254
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the trigger record was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the trigger record. Max-254
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the trigger record was last modified.
   */
  lastModifiedOn?: Date;
}
