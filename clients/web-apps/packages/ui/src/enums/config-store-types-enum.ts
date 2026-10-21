/**
 * Enum representing the types of config.
 *
 * IMPORTANT NOTE: Any changes to this file should be manually synced with back-end enum file and
 * also we need to update existing config in the database.
 */
export enum ConfigStoreTypesEnum {
  TEXT = "Text",
  BOOLEAN = "Boolean",
  // CREDENTIAL = "Credential",
  JSON = "JSON",
}
