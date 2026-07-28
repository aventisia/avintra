/**
 * Enum representing the access types of Project Template.
 *
 * IMPORTANT NOTE: Any changes to this file should be manually synced with back-end enum file and
 * also we need to update existing flows in the database.
 */
export enum TemplateAccessTypesEnum {
  TenantLevel = "Tenant",
  Public = "Public",
  // Space = "Space",TODO: to be used later
}
