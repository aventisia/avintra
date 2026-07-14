import type { MachineEnvironmentTypesEnum } from "@/react-toolkit/enums/machine-environment-types-enum";
import type { MachineOsTypesEnum } from "@/react-toolkit/enums/machine-os-types-enum";
import type { MachineStatusTypesEnum } from "@/react-toolkit/enums/machine-status-types-enum";

/**
 * Represents a data transfer object (DTO) for a machine.
 */
export interface MachinesTableDto {
  /**
   * Gets or sets the primary key of the machine record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the tenant id where the machine belongs.
   */
  tenantId?: string;

  /**
   * Gets or sets the machine name. Max-255.
   */
  name: string;

  /**
   * Gets or sets the machine IP address. Max-100.
   */
  ipAddress?: string;

  /**
   * Gets or sets the host name of the machine. Max-255.
   */
  hostname: string;

  /**
   * Gets or sets the desktop app username on the machine. Max-255.
   */
  username: string;

  /**
   * Gets or sets the unique operating system identifier of the machine. Max-100.
   */
  osID: string;

  /**
   * Gets or sets the operating system type of the machine.
   */
  operatingSystem: MachineOsTypesEnum;

  /**
   * Gets or sets the status of the machine.
   */
  status: MachineStatusTypesEnum;

  /**
   * Gets or sets the environment of the machine.
   */
  environment: MachineEnvironmentTypesEnum;

  /**
   * Gets or sets the currently running flow version task, if any.
   */
  currentTask?: string;

  /**
   * Represents the availability of the machine for another task. True if available, False if not.
   */
  isAvailable?: boolean;

  /**
   * Represents the timestamp of when the machine was last checked in
   */
  lastCheckedIn?: Date;

  /**
   * Gets or sets the machine connection identifier.
   */
  connectionId?: string;

  /**
   * Represents the license used for assignment controls in UI, when available.
   */
  licenseId?: string;

  /**
   * Gets or sets a flag indicating whether the user record is disabled.
   * Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the machine record. Max-254
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the machine record was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the machine record. Max-254
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the machine record was last modified.
   */
  lastModifiedOn?: Date;

  /**
   * Gets or sets initials of the user who created the machine record.
   */
  createdByUserInitials?: string;

  /**
   * Gets the count of the flow versions assigned to the machine.
   */
  flowVersionCount?: number;

  /**
   * Gets the identifiers of the flow versions assigned to the machine.
   */
  flowVersionIds?: string[];
}
