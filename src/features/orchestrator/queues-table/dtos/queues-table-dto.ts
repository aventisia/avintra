/**
 * Represents a data transfer object (DTO) for a queue.
 */
export interface QueuesTableDto {
  /**
   * Gets or sets the primary key of the queue record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the name of the queue. Max-255
   */
  name: string;

  /**
   * Gets or sets the number of pednding transactions in the queue.
   */
  pendingCount?: number;

  /**
 * Gets or sets the number of inprogress transactions in the queue.
 */
  inprogressCount?: number;

  /**
 * Gets or sets the number of completed transactions in the queue.
 */
  completedCount?: number;

  /**
 * Gets or sets the number of failed transactions in the queue.
 */
  failedCount?: number;

  /**
 * Gets or sets the number of total transactions in the queue.
 */
  totalCount?: number;

  /**
 * Gets or sets last update time of the queue.
 */
  lastUpdatedOn: Date;


  /**
   * Gets or sets a flag indicating whether the queue record is disabled.
   *
   * Not making it required because same DTO is used for insert and update.
   *
   * Its important to have this property nullable because we need to differentiate between true; false and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the queue record. Max-254
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the queue record was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the queue record. Max-254
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the queue record was last modified.
   */
  lastModifiedOn?: Date;
}
