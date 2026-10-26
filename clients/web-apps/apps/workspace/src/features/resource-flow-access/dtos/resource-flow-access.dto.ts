import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";

import { ResourceTypeEnum } from "../../resource-user-access/enums/resource-type-enum";

export interface AssignResourceFlowsDto {
  resourceType: ResourceTypeEnum;
  resourceId: string;
  flowIds: string[];
}

export interface AssignResourceFlowsResultDto {
  assignedCount: number;
  removedCount: number;
  unassignedPublishedFlows: string[];
}

export interface ResourceAssignedFlowDto {
  id: string;
  name: string;
  type: FlowTypesEnum;
  versionCount: number;
  lastModifiedOn: string | null;
}
