/**
 * Represents the payload used to update a machine.
 * Only the assigned flow versions and the disabled state are editable through
 * the web frontend. Identity fields are managed by the desktop-app registration.
 */
export interface UpdateMachineDto {
  /**
   * Gets or sets the unique identifier of the machine.
   */
  id: string;

  /**
   * Many-to-Many relationship: Represents the list of flow version identifiers associated with the machine.
   * Each identifier is a GUID that uniquely represents a flow version.
   */
  flowVersionIds: string[];

  /**
   * Gets or sets a flag indicating whether the machine is disabled.
   */
  isDisabled: boolean;
}
