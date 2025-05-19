/**
 * Represents the various statuses for license credits.
 *
 * IMPORTANT NOTE: Any changes to this file should be manually synced with back-end enum file and
 * also we need to update existing licnences in the database.
 */
export enum LicenseCreditStatusesEnum {
  /* Indicates that the license credit has been requested and is awaiting approval from the relevant authority.
   *Requested for approval
   */
  Requested = "Requested",

  /* Indicates that the license credit request is currently under review and has not yet been approved or denied.
   *Pending approval
   */
  Pending = "Pending",

  /* Indicates that the license credit has been approved and is available for use by the requester.
   *Approved for use
   */
  Approved = "Approved",

  /* Indicates that the license credit request has been reviewed and rejected, making it unusable.
   *Rejected and not usable
   */
  Rejected = "Rejected",

  /* Indicates that the license credit has expired and is no longer valid for use.
   *Expired and no longer valid
   */
  Expired = "Expired",
}
