import { FlowTypesEnum } from "@/react-toolkit/enums/flow-types-enum";

/** To get flow props to load when user opens a flow in studio */
export interface LoadFlowDto {
  /** Flow record's primary key (Guid). FlowId */
  id: string;

  /** Flow's name */
  name: string;

  /** Version id */
  versionId: string;

  /** Version no */
  versionNumber: number;

  /** Flow's nodes, edges, and viewport JSON data in string format */
  reactFlowObject: string;

  /** Output Variables object, i..e the Flow Variables */
  flowVariablesObject: string;

  /** Flow's inputs outputs JSON data in string format */
  inputOutputObject?: string;

  isPublished: boolean;
  isLocked: boolean;
  isDraft: boolean;
  isArchived: boolean;
  type: FlowTypesEnum;
  description?: string;
  supportedPlatform?: string;

  accessType?: string;
}
