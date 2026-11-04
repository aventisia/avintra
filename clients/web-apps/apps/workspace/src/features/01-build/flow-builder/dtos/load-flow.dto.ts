import { FlowTypesEnum } from "@avplatform/ui/enums";

import { ExecutionSettings } from "@/features/03-orchestrator/agents-table";
import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";

export interface LoadFlowDto {
  id: string;
  versionId: string;
  versionNumber: number;
  name: string;
  reactFlowObject?: string | null;
  flowVariablesObject?: string | null;
  inputOutputObject?: string | null;
  isLocked: boolean;
  isDraft: boolean;
  isPublished: boolean;
  isArchived: boolean;
  type: FlowTypesEnum;
  spaceId?: string | null;
  description?: string | null;
  accessLevel?: ResourceAccessTypeEnum | null;
  supportedPlatform?: string | null;
  settings?: ExecutionSettings | null;
}
