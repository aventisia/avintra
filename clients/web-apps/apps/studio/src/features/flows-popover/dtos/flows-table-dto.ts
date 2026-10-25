import { FlowTypesEnum } from "@avplatform/ui/enums";

/* Note: File name is flows-table-dto.ts instead of flows-popover-dto.ts because 
  its a copy of flows-table feature of workspace app and both will be using the 
  same api endpoints so any change to the dto is going to affect both the files. 
  So, we just need to replace the file.
*/

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

  /**
   * Whether the latest flow version is archived.
   */
  isArchived?: boolean;

  /**
   * Whether the latest flow version is published.
   */
  isPublished?: boolean;

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
}
