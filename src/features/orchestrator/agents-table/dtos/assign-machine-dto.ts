import type { MachineOsTypesEnum } from "@/react-toolkit/enums/machine-os-types-enum"

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
    id: string
    tenantId: string
    agentId: string
    name: string
    isDisabled: boolean,
    createdBy: string
    createdOn: Date
    lastModifiedBy: string
    machineType?: MachineOsTypesEnum
    lastModifiedOn: Date
    isAssigned: boolean
}