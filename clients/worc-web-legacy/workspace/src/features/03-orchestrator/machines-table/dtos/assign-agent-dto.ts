/**
 * Represents the payload used to synchronize flow versions assigned to a machine.
 */
export interface UpdateMachineFlowVersionsDto {
  machineId: string;
  flowVersionIds: string[];
}
