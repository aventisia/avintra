export interface QueueAgentsDto {
  /** Unique identifier for the queue flow version */
  id?: string;

  /** Unique identifier for the flow version associated with the queue */
  flowVersionId: string;

  versionNumber?: string;

  /** Name of the flow version that the queue is associated with */
  flowName?: string | null;

  /** Unique identifier for the queue that the flow version belongs to */
  queueId: string;

  /** Name of the queue that the flow version is associated with */
  queueName?: string | null;

  accessType?: string;
  /**
   * Flag indicating whether the queue flow version is disabled.
   * Nullable to distinguish between `true`, `false`, and `null`
   */
  isDisabled?: boolean | null;

  /** Username of the creator of the record (response only) */
  createdBy?: string | null;

  /** Timestamp of when the record was created (response only) */
  createdOn?: Date | string | null;

  /** Username of the last user who modified the record (response only) */
  lastModifiedBy?: string | null;

  /** Timestamp of when the record was last modified (response only) */
  lastModifiedOn?: Date | string | null;
}
