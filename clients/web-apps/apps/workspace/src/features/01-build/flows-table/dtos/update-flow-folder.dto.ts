/**
 * Represents the payload used to move a flow into a folder or to the top level.
 */
export interface UpdateFlowFolderDto {
  /**
   * Gets or sets the unique identifier of the flow to move.
   */
  flowId: string;

  /**
   * Gets or sets the unique identifier of the target folder. Null moves the flow to the top level.
   */
  folderId: string | null;
}
