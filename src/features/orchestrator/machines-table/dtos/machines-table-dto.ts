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
   * Gets or sets the name of the machine. Max-100
   */
  name: string;

  /**
   * Gets or sets the host name of the machine. Max-100
   */
  ipAddress?: string;

  /**
   * Gets or sets the name of the machine. Max-100
   */
  hostname?: string;

  osId?: string;

  /**
   * Gets or sets the type of machine os.
   */
  type: MachineOsTypesEnum;

  /**
   * Gets or sets the status of the machine. Max-100
   */
  status: MachineStatusTypesEnum;

  /**
   * Gets or sets the environment of the machine. Max-100
   */
  environment: MachineEnvironmentTypesEnum;

  /**
   * Gets or sets the environment of the machine. Max-100
   */
  currentTask: string;

  /**
   * Represents the availability of the machine for another task. True if available, False if not.
   */
  isAvailable?: boolean;

  /**
   * Represents the timestamp of when the machine was last checked in
   */
  lastCheckedIn?: Date;

  /**
   * Represents the license to select the agent to the machine
   */
  licenseId: string;

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
   * Gets the count of the agents assigned to the machine.
   */
  agentCount?: number;

  /**
   * Gets the count of the agents assigned to the machine.
   */
  agentIds?: string[];
}
