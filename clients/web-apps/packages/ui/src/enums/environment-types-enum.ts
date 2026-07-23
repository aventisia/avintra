/**
 * Enum representing the types of operating systems.
 *
 * IMPORTANT NOTE: Any changes to this file should be manually synced with back-end enum file and
 * also we need to update existing machines in the database.
 */
export enum EnvironmentTypesEnum {
  Development = "Development",
  UAT = "UAT",
  Production = "Production",
}
