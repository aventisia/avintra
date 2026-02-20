export interface QueueUserDto {
  /** Unique identifier for the queue user */
  id?: string;

  /** Unique identifier for the user associated with the queue */
  userId: string;

  /** FirstName of the user that the queue is associated with */
  firstName?: string | null;

  /** LastName of the user that the queue is associated with */
  lastName?: string | null;

  /** Name of the user that the queue is associated with */
  username?: string | null;

  /** Intial of the user that the queue is associated with */
  createdByUserInitials?: string | null;

  /** Unique identifier for the queue that the user belongs to */
  queueId: string;

  /** Name of the queue that the user is associated with */
  queueName?: string | null;

  accessType?: string;

  /**
   * Flag indicating whether the user is disabled.
   * Nullable to distinguish between true, false, and null
   */
  isDisabled?: boolean | null;

  /** Username of the creator of the record (response only) */
  createdBy?: string | null;

  /** Timestamp of when the record was created (response only, ISO string) */
  createdOn?: string | null;

  /** Username of the last user who modified the record (response only) */
  lastModifiedBy?: string | null;

  /** Timestamp of when the record was last modified (response only, ISO string) */
  lastModifiedOn?: string | null;
}
