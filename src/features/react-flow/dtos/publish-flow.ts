import { AccessTypeEnum } from "@/features/flow-block/constants/access-type-enum";
import { PublishTypeEnum } from "@/features/flow-block/constants/publish-type-enum";

/** To update flow's isPublished */
export interface PublishFlowDto {
  /** Flow record's primary key (Guid) */
  flowId: string;

  /** Flow's nodes, edges, and viewport JSON data in string format */
  reactFlowObject: string;

  id: string;

  isPublished: boolean;

  accessType: AccessTypeEnum;

  type: PublishTypeEnum;
}
