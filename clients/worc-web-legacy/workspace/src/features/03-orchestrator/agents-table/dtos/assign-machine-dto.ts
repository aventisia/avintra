import { EnvironmentTypesEnum } from "@/react-toolkit/enums/machine-environment-types-enum";
import type { OsTypesEnum } from "@/react-toolkit/enums/machine-os-types-enum";
import { MachineStatusTypesEnum } from "@/react-toolkit/enums/machine-status-types-enum";

/**
 * data transfer object for getting the machine data to select and assign to agent.
 *
 * @export
 * @interface AssignMachineDto
 */
export interface AssignMachineDto {
  /**
   *
   * id for the record
   * @type {string}
   * @memberof AssignMachineDto
   */
  id: string;
  tenantId: string;
  agentId: string;
  name: string;
  isDisabled: boolean;
  createdBy: string;
  createdOn: Date;
  lastModifiedBy: string;
  type?: OsTypesEnum;
  environment?: EnvironmentTypesEnum;
  lastModifiedOn: Date;
  isAssigned: boolean;
  osId?: string;
  /**
   * Gets or sets the status of the machine. Max-100
   */
  status: MachineStatusTypesEnum;

  jobId?: string;
}
