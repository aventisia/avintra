import type { EnvironmentTypesEnum } from "@/react-toolkit/enums/environment-types-enum";
import type { OsTypesEnum } from "@/react-toolkit/enums/os-types-enum";

/**
 * Represents the payload used to update a machine.
 */
export interface UpdateMachineDto {
  /**
   * Gets or sets the unique identifier of the machine.
   */
  id: string;

  /**
   * Represents the environment of the machine, e.g., Development, UAT, Production.
   */
  environment: EnvironmentTypesEnum;

  /**
   * Represents the operating system of the machine, e.g., Windows or Linux.
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
   * Many-to-Many relationship: Represents the list of flow version identifiers associated with the machine.
   * Each identifier is a GUID that uniquely represents a flow version.
   */
  flowVersionIds: string[];

  /**
   * Gets or sets a flag indicating whether the machine is disabled.
   */
  isDisabled: boolean;
}
