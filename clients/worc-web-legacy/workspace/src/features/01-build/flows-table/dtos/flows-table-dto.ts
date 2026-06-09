import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { FlowTypesEnum } from "@/react-toolkit/enums/flow-types-enum";

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
   * Gets or sets the type of the flow.
   */
  type: FlowTypesEnum; // TODO: Update enum values

  /**
   * Gets or sets the name of the flow. Max-255
   */
  name: string;

  /**
   * Gets the latest version of the flow.
   */
  versionNumber?: number;
  /**
   * Gets or sets the thumbnail of the flow.
   */
  thumbnail?: string;

  /**
   * Gets or sets the description of the flow. Max-500
   */
  description?: string;

  /**
   * Gets or sets the number of flow comments associated with the flow record.
   */
  flowCommentCount?: number;

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
   * Gets or sets the date and time when the flow record was last modified.
   */
  lastModifiedOn?: Date;
}
