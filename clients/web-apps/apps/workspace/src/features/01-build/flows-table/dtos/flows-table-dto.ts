import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";

import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";

import { AccessTypeEnum } from "../constants/access-type-enum";

/**
 * Represents a data transfer object (DTO) for a flow.
 */
export interface FlowsTableDto {
  /**
   * Gets or sets the primary key of the flow record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the ID of the folder the flow is organized in. Null means the top level.
   *
   * Only honored on insert; use the dedicated folder update to move an existing flow.
   */
  folderId?: string | null;

  /**
   * Gets or sets the type of the flow.
   */
  type: FlowTypesEnum;

  /**
   * Gets or sets the name of the flow. Max-255
   */
  name: string;

  /**
   * Gets the latest version of the flow.
   */
  versionNumber?: number;

  /**
   * Whether the latest flow version is archived.
   */
  isArchived?: boolean;

  /**
   * Whether the latest flow version is published.
   */
  isPublished?: boolean;

  /**
   * Gets or sets the thumbnail of the flow.
   */
  thumbnail?: string;

  /**
   * Gets or sets the description of the flow. Max-500
   */
  description?: string;

  /**
   * Gets or sets a flag indicating whether the flow record is disabled.
   *
   * Not making it required because same DTO is used for insert and update.
   *
   * Its important to have this property nullable because we need to differentiate between true, false and null.
   */
  isDisabled?: boolean;

  accessType: AccessTypeEnum;

  supportedPlatform?: string;

  /**
   * Access level of the configuration item.
   */
  accessLevel: ResourceAccessTypeEnum;

  /**
   * Indicates whether the flow is accessible
   * to all users within the tenant.
   */
  isTenantWideAccess: boolean;

  /**
   * Gets or sets the username of the user who created the flow record. Max-254
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the flow record was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the flow record. Max-254
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the flow record or its latest version was last modified.
   */
  lastModifiedOn?: Date;

  /**
   * Gets or sets the distinct AI model names referenced by the agent's latest workflow.
   */
  aiModels?: string[];

  /**
   * Gets or sets the queues linked to the agent (flow).
   */
  queues?: FlowQueueDto[];
}

/**
 * Lightweight DTO describing a queue linked to an agent (flow).
 */
export interface FlowQueueDto {
  /**
   * Gets or sets the Id of the queue.
   */
  id: string;
  /**
   * Gets or sets the name of the queue.
   */
  name: string;
  /**
   * Gets or sets the type of the queue (Agent / User).
   */
  type?: string;
}
