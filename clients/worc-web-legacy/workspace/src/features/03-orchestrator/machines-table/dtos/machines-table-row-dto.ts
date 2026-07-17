import type { EnvironmentTypesEnum } from "@/react-toolkit/enums/environment-types-enum";
import type { MachineStatusEnum } from "@/react-toolkit/enums/machine-status-enum";
import type { OsTypesEnum } from "@/react-toolkit/enums/os-types-enum";

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
   * Represents the environment of the machine, e.g., Development, UAT, Production.
   */
  environment: EnvironmentTypesEnum;

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
   * Optional IP address of the machine (supports IPv4 or IPv6, max length 100).
   */
  ipAddress?: string;

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
   * Gets or sets the username of the user who created the user record.
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdBy: string;

  /**
   * Gets or sets the date and time when the user record was created.
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdOn: Date;

  /**
   * Gets or sets the username of the user who last modified the user record.
   * This property is intended for use in responses only and should not be included in requests.
   */
  lastModifiedBy: string;

  /**
   * Gets or sets the date and time when the user record was last modified.
   * This property is intended for use in responses only and should not be included in requests.
   */
  lastModifiedOn: Date;
}
