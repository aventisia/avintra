/**
 * Data Transfer Object (DTO) used for select option lists in credentials-related APIs.
 * This DTO is shared between insert and update operations.
 */
export interface VaultCredentialSelectDto {
  /**
   * Display label shown in the dropdown/select list.
   */
  label: string;

  /**
   * Value associated with the option.
   */
  value: string; // TODO: Replace with enum

  /**
   * Indicates whether the option should be disabled (non-selectable) in the UI.
   */
  disabled?: boolean;

  /**
   * Optional fixed value associated with this option (e.g., pre-filled or non-editable field).
   */
  fixed?: string | null;

  /**
   * Optional description providing additional context for the option.
   */
  description?: string;
}
