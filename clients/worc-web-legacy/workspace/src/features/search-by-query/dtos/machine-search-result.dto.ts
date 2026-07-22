import type { MachineStatusEnum } from "@/react-toolkit/enums/machine-status-enum";

/**
 * Represents a data transfer object (DTO) for a Search Machine.
 */
export interface MachineSearchResultDto {
  /**
   * Unique identifier of the machine.
   */
  machineId: string;

  /**
   * Unique name of the machine.
   */
  machineName: string;

  /**
   * Status of the machine.
   */
  status: MachineStatusEnum;
}
