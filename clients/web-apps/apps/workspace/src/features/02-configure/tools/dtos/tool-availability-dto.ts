/**
 * Represents a data transfer object (DTO) for checking tool name availability.
 */
export interface ToolAvailabilityDto {
  /**
   * Tool name entered by the user.
   */
  userInput: string;

  /**
   * Identifier of the tool being edited, if any.
   */
  id?: string;
}
