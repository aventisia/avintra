/**
 * Enum representing the types of status of the machine.
 *
 * IMPORTANT NOTE: Any changes to this file should be manually synced with back-end enum file and
 * also we need to update existing machines in the database.
 */
export enum MachineStatusEnum {
  /// <summary>
  /// represents the free status of the machine
  /// </summary>
  Idle = "Idle",

  /// <summary>
  /// represents the online status of the machine
  /// </summary>
  Online = "Online",

  /// <summary>
  /// represents the offline status of the machine
  /// </summary>
  Offline = "Offline",

  /// <summary>
  /// represents the flow/agent running status of the machine
  /// </summary>
  Running = "Running",

  /// <summary>
  /// represents the flow/agent stopped status of the machine
  /// </summary>
  Stopped = "Stopped",
}
