/**
 * Enum representing the types of status of the machine.
 *
 * IMPORTANT NOTE: Any changes to this file should be manually synced with back-end enum file and
 * also we need to update existing machines in the database.
 */
export enum MachineStatusTypesEnum {
  Active = "Active",
  Inactive = "Inactive",
}
