/**
 * SaveAsTemplateDto
 *
 * Data Transfer Object used to save a flow as a template.
 * Intended for creating a new template.
 */
export interface SaveAsTemplateDto {
  /** Name of the template (required) */
  name: string;

  /** Optional description of the template */
  description?: string;

  /** Type of entity to save as (e.g., 'Agent', 'BLock') */
  type: string;

  /** Access level (e.g., 'Public', 'Tenant', 'Spaces') */
  accessType: string;

  /** Optional tags associated with the template */
  tags?: string[];

  /** Reference ID of the original flow or source */
  refId: string;
}
