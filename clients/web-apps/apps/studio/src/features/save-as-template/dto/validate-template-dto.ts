/**
 * ValidateTemplateDto
 *
 * Data Transfer Object used to save a flow as a template.
 * Intended for creating a new template.
 */
export interface ValidateTemplateDto {
  /** Access level (e.g., 'Public', 'Tenant', 'Spaces') */
  accessType?: string;

  /** Reference ID of the original flow or source */
  refId: string;

  id?: string;
  name?: string;
  type?: string;
  status?: string;
  isApprovedTemplate?: boolean;
}
