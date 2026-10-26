import { TriggerFrequencyTypesEnum } from "@/enums/trigger-frequency-types-enum";
import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";

/**
 * Represents a data transfer object (DTO) for a time trigger configuration.
 */
export interface TimeTriggerDto {
  /**
   * Gets or sets the unique identifier for the time trigger.
   */
  id?: string;

  /**
   * Gets or sets the Tenant ID associated with the time trigger.
   */
  tenantId: string;

  /**
   * Gets or sets the name of the time trigger.
   */
  name: string;

  agents?: {
    is: string;
    name: string;
    versionNumber: number;
  }[];
  /**
   * Gets or sets the time zone for the time trigger.
   */
  timezone: string;

  /**
   * Gets or sets the frequency type for the time trigger (e.g., daily, weekly).
   */
  frequency: TriggerFrequencyTypesEnum;

  /**
   * Gets or sets the interval between trigger executions (e.g., every N days, hours, etc.). Default is 1.
   */
  interval?: number;

  /**
   * Gets or sets the specific time of day when the trigger should fire, or null if no specific time is set.
   */
  atTime?: string | null; // Time is stored as string in ISO 8601 format (HH:mm)

  /**
   * Gets or sets the list of weekdays (1=Monday, ..., 7=Sunday) on which the trigger should activate.
   */
  weekdays?: number[];

  /**
   * Gets or sets the list of specific days of the month (1-31) on which the trigger should activate.
   */
  monthDays?: number[];

  /**
   * Gets or sets the cron expression that defines a schedule for the time trigger.
   */
  cronExpression?: string;

  /**
   * Gets or sets the date and time when the time trigger becomes active.
   */
  effectiveDate: string; // Date in ISO 8601 format (yyyy-MM-ddTHH:mm:ssZ)

  /**
   * Gets or sets the date and time when the time trigger will stop being active. Null if there is no end date.
   */
  endDate?: string | null; // Date in ISO 8601 format (nullable)

  /**
   * Gets or sets the last time the time trigger was activated.
   */
  lastTriggeredTime?: string; // Date in ISO 8601 format

  /**
   * Gets or sets the next scheduled activation time for the time trigger.
   */
  nextTriggerTime?: string; // Date in ISO 8601 format

  /**
   * Gets or sets the list of hours (0-23) during which the time trigger should not fire.
   */
  exceptionHours?: number[];

  /**
   * Gets or sets the list of weekdays (1=Monday, ..., 7=Sunday) when the time trigger should be excluded.
   */
  exceptionWeekdays?: number[];

  /**
   * Gets or sets the list of specific dates when the time trigger should be excluded.
   */
  exceptionDates?: string[]; // Dates in ISO 8601 format

  /**
   * Access level of the configuration item.
   */
  accessLevel: ResourceAccessTypeEnum;

  /**
   * Indicates whether the kb is accessible
   * to all users within the tenant.
   */
  isTenantWideAccess: boolean;

  /**
   * Gets or sets a flag indicating whether the time trigger is disabled.
   */
  isDisabled?: boolean | null;

  /**
   * Gets or sets the username of the user who created the time trigger record.
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the time trigger record was created.
   */
  createdOn?: string; // Date in ISO 8601 format

  /**
   * Gets or sets the username of the user who last modified the time trigger record.
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the time trigger record was last modified.
   */
  lastModifiedOn?: string; // Date in ISO 8601 format
}
