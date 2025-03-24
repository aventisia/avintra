/**
 * Represents a data transfer object (DTO) for a queue.
 */
export interface QueuesTableDto {
  /**
   * Gets or sets the primary key of the queue record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string

  /**
   * Gets or sets the name of the queue. Max-255
   */
  name: string


  /**
 * Gets or sets the description of the queue. Max-255
 */
  description: string

  /**
   * Gets or sets the wheather to enforce the uniqueness of the queue.
   */
  hasUniqueRef: boolean

  /**
 * Gets or sets the wheather to store the queue in encrypted format.
 */
  isEncrypted: boolean

  /**
 * Gets or sets the wheather to maximum retry attempts for queue.
 */
  maxRetries: number

  /**
 * Gets or sets the wheather to retry failed items in queue.
 */
  retryFailed: boolean

  /**
 * Gets or sets the wheather to retry abandoned items queue.
 */
  retryAbandoned: boolean

  /**
   * Gets or sets the peding count of items in queue.
   */
  pendingCount?: number

  /**
 * Gets or sets the number of inprogress transactions in the queue.
 */
  inprogressCount?: number

  /**
 * Gets or sets the number of completed transactions in the queue.
 */
  completedCount?: number

  /**
 * Gets or sets the number of failed transactions in the queue.
 */
  failedCount?: number

  /**
 * Gets or sets the number of total transactions in the queue.
 */
  totalCount?: number

  /**
 * Gets or sets last update time of the queue.
 */
  lastUpdatedOn: Date


  /**
   * Gets or sets a flag indicating whether the queue record is disabled.
   *
   * Not making it required because same DTO is used for insert and update.
   *
   * Its important to have this property nullable because we need to differentiate between true; false and null.
   */
  isDisabled?: boolean

  /**
   * Gets or sets the username of the user who created the queue record. Max-254
   */
  createdBy?: string

  /**
   * Gets or sets the date and time when the queue record was created.
   */
  createdOn?: Date

  /**
   * Gets or sets the username of the user who last modified the queue record. Max-254
   */
  lastModifiedBy?: string

  /**
   * Gets or sets the date and time when the queue record was last modified.
   */
  lastModifiedOn?: Date
}
