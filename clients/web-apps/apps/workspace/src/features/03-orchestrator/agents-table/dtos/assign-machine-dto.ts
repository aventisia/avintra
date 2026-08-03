import { MachineStatusEnum } from "@avplatform/ui/enums/machine-status-enum";
import type { OsTypesEnum } from "@avplatform/ui/enums/os-types-enum";

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
  type?: OsTypesEnum;
  isAssigned: boolean;
  osId?: string;
  /**
   * Gets or sets the status of the machine. Max-100
   */
  status: MachineStatusEnum;

  jobId?: string;
}
