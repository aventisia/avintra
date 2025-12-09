/**
 * Represents a data transfer object (DTO) for a Search Block.
 */
export interface SearchBlocksDto {
  /**
   * Unique identifier for block.
   */
  id: string;

  /**
   * Name of the block.
   */
  name: string;

  /**
   * Optional description for the block.
   */
  description?: string;

  /**
   * Type of the block (Public, TenantLevel, AgentLevel).
   */
  type: string;

  /**
   * Version number.
   */
  versionNumber?: number;

  /**
   * Identifier for the associated flow version.
   */
  flowId: string;

  /**
   * Indicates if the block is disabled.
   */
  isDisabled: boolean;

  /**
   * Username of the user who created the block.
   */
  createdBy: string;

  /**
   * Date and time when the block was created.
   */
  createdOn: Date | string;

  /**
   * Username of the user who last modified the block.
   */
  lastModifiedBy: string | null;

  /**
   * Date and time when the block was last modified.
   */
  lastModifiedOn: Date | string | null;
}
