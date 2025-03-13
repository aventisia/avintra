/**
 * Enum representing the types of config.
 *
 * IMPORTANT NOTE: Any changes to this file should be manually synced with back-end enum file and
 * also we need to update existing config in the database.
 */
export enum ConfigItemTypesEnum {
  TEXT = "TEXT",
  BOOLEAN = "BOOLEAN",
  CREDENTIAL = "CREDENTIAL",
  JSON = "JSON",
}
