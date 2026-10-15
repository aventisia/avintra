import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";

/**
 * Represents a data transfer object (DTO) for a custom UI builder project.
 */
export interface UiBuilderTableDto {
  /**
   * Gets or sets the primary key of the project record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the name of the project. Max-255
   */
  name: string;

  /**
   * Gets or sets the description of the project. Max-500
   */
  description?: string;

  /**
   * Indicates whether the project is accessible to all users within the tenant.
   */
  isTenantWideAccess: boolean;

  /**
   * Gets the number of generated versions stored for the project.
   */
  versionCount?: number;

  /**
   * Access level of the project.
   */
  accessLevel: ResourceAccessTypeEnum;

  /**
   * Gets or sets a flag indicating whether the project record is disabled.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the project record.
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the project record was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the project record.
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the project record was last modified.
   */
  lastModifiedOn?: Date;
}
