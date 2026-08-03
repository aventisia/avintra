import type { MachineStatusEnum } from "@avplatform/ui/enums/machine-status-enum";
import type { OsTypesEnum } from "@avplatform/ui/enums/os-types-enum";

/**
 * Represents a data transfer object (DTO) for a machine.
 * NOTE: Same DTO will be used for table row, machine record and exporting machine data to CSV.
 * Display attributes are used to define the column names for the exported CSV file.
 */
export interface MachinesTableRowDto {
  /**
   * Gets or sets the unique identifier of the machine.
   */
  id: string;

  /**
   * Gets or sets the generated unique machine name.
   */
  name: string;

  /**
   * Represents the operating system of the machine, e.g., Windows, Linux.
   */
  operatingSystem: OsTypesEnum;

  /**
   * Gets or sets the identifier that uniquely represents the operating system (max length 100).
   */
  osID: string;

  /**
   * Represents the username of the machine (max length 255).
   */
  username: string;

  /**
   * Represents the host name of the machine (max length 255).
   */
  hostname: string;

  /**
   * Represents the timestamp of when the machine was last checked in.
   */
  lastCheckedIn: string;

  /**
   * Represents the status of the machine.
   */
  status: MachineStatusEnum;

  /**
   * Gets or sets the number of flow versions associated with the machine.
   */
  flowVersionCount: number;

  /**
   * Gets or sets a flag indicating whether the user record is disabled.
   */
  isDisabled: boolean;

  /**
   * Gets or sets the linked user account of the machine.
   * The value could be the linked user's unique username or user id.
   * This property is intended for use in responses only and should not be included in requests.
   */
  linkedUserAccount: string;

  /**
   * Gets or sets the date and time when the machine record was created.
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdAt: string;
}
