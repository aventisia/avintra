/**
 * Represents a link between a flow version and a tool.
 */
export interface FlowVersionToolDto {
  id?: string;

  /**
   * Identifier of the flow version.
   */
  flowVersionId: string;

  /**
   * Identifier of the tool.
   */
  toolId: string;

  /**
   * Optional list of allowed operation identifiers.
   */
  allowedOperations?: string[];

  /**
   * Optional credential NAME override for this flow version.
   */
  credentialName?: string;
}
