export interface DeactivationStatusDto {
  /// shows the status of the is account in deactivation
  deactivating: boolean;

  /// shows the time left in deactivation. usualy 10 days
  timeRemains: Date;
}
