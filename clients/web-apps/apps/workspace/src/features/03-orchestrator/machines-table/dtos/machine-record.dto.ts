import type { EnvironmentTypesEnum } from "@avplatform/ui/enums/environment-types-enum";
import type { MachineStatusEnum } from "@avplatform/ui/enums/machine-status-enum";
import type { OsTypesEnum } from "@avplatform/ui/enums/os-types-enum";
import type { ISelectOption } from "@avplatform/ui/types";

/**
 * Represents an assigned flow version on a machine as a select option.
 */
export interface MachineFlowVersionDto extends ISelectOption {
  /** The identifier of the parent flow. */
  flowId: string;

  /** The version number of the flow version. */
  versionNumber: number;
}

/**
 * Represents machine record data returned by the "get by id" machine API.
 */
export interface MachineRecordDto {
  /** The unique identifier of the machine. */
  id: string;

  /** The generated unique machine name. */
  name: string;

  /** The environment of the machine (e.g., Development, UAT, Production). */
  environment: EnvironmentTypesEnum;

  /** The operating system of the machine (e.g., Windows, Linux). */
  operatingSystem: OsTypesEnum;

  /** The identifier that uniquely represents the operating system (max length 100). */
  osID: string;

  /** The username of the machine (max length 255). */
  username: string;

  /** The host name of the machine (max length 255). */
  hostname: string;

  /** Optional IP address of the machine (supports IPv4 or IPv6, max length 100). */
  ipAddress?: string;

  /** The timestamp of when the machine was last checked in. */
  lastCheckedIn: string;

  /** The status of the machine. */
  status: MachineStatusEnum;

  /** The flow versions associated with the machine as select options. */
  machineFlowVersions: MachineFlowVersionDto[];

  /** Flag indicating whether the machine record is disabled. */
  isDisabled: boolean;

  /** The username of the user who created the machine record (response only). */
  createdBy: string;

  /** The date and time when the machine record was created (response only). */
  createdOn: Date;

  /** The username of the user who last modified the machine record (response only). */
  lastModifiedBy: string;

  /** The date and time when the machine record was last modified (response only). */
  lastModifiedOn: Date;
}
