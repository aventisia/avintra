/**
 * WorcTemplatesDto
 *
 * Data Transfer Object representing a single Worc Template.
 * Used for displaying, filtering, or selecting templates in the UI.
 */
export interface WorcTemplatesDto {
  /** Unique identifier for the template */
  id: string;

  /** Display name of the template */
  name: string;

  /** Description providing context or usage info */
  description: string;

  /** Type of the template (e.g., 'Agent', 'Model') */
  type: string;

  /** Number of times this template has been used */
  usagesCount: number;

  /** Tags for categorization or filtering */
  tags: string[];

  /** Reference ID for linking to the actual resource */
  refId: string;

  /** Access level of the template (e.g., 'Public', 'Tenant', 'Spaces') */
  accessType: string;

  /** Indicates if the template is currently disabled (optional) */
  isDisabled?: boolean;

  /** Optional purpose or intent of the template */
  purpose?: string;

  /** ID of the user who created the template (optional) */
  createdBy?: string;

  /** Username of the creator (optional) */
  createdByUsername?: string;

  /** Timestamp for when the template was created (optional) */
  createdOn?: Date;

  /** List of icon URLs or names associated with the template */
  icons: string[];
}
