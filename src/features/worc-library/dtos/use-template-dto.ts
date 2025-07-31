/**
 * UseTemplateDTO
 *
 * Data Transfer Object used when applying a saved template (e.g., model or agent).
 */
export interface UseTemplateDTO {
  /** Unique identifier of the template */
  id: string;

  /** Display name of the template */
  name: string;

  /** Description of the template's purpose or content */
  description: string;

  /** Reference ID linked to the actual model or agent */
  refId: string;

  /** Optional type of the template (e.g., 'Agent', 'Model') */
  type?: string;

  /** Optional access level (e.g., 'Public', 'Tenant') */
  accessType?: string;

  /** Optional tags for categorization or filtering */
  tags?: string[];

  /** Optional identifier for the template's creator */
  createdBy?: string;
}
