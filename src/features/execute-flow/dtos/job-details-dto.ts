import { FlowTypesEnum } from "@/react-toolkit/enums/flow-types-enum";

/** To get jobs data */
export interface JobDetailsDto {
  /** JobId */
  id: string;

  /** Agent name */
  name: string;

  /** Agent Id */
  flowId: string;

  /**Agent Version id */
  flowVersionId: string;

  /**Trigger type */
  triggerType: string;

  priority: string;

  status: string;

  machineId: string;

  /** Version no */
  versionNumber: number;

  /** Flow's nodes, edges, and viewport JSON data in string format */
  reactFlowObject: string;

  /** Output Variables object, i..e the Flow Variables */
  flowVariablesObject: string;

  /** Flow's inputs outputs JSON data in string format */
  inputOutputObject?: string;

  type: FlowTypesEnum;
}
