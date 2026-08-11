export interface QueueWorkItemDto {
  /**
   * Gets or sets the ID of the flow this version is associated with.
   */

  id?: string;

  /**
   * Gets or sets the name of the queue.
   */

  queueName?: string;

  /**
   * Gets or sets the current status of the queue transaction (e.g., Pending, In Progress, Completed, Failed,
   * or a queue-specific custom disposition status such as Approved or Rejected).
   */

  status?: string;

  fileUrls?: string[];
  /**
   * Gets or sets the payload data associated with this transaction, which may include relevant details for processing.
   */

  payloadData?: string;

  workItemData?: string;

  /**
   * Gets or sets the identifier for the queue to which this transaction belongs.
   */

  queueId: string;

  /**
   * Gets or sets the username of the user who created the credentials record. Max-254
   */
  createdBy?: string;

  /**
   * Gets or sets the username of the user who has claimed/assigned this work item.
   */
  assignee?: string;

  /**
   * Gets or sets the date and time when the credentials record was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the credentials record. Max-254
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the credentials record was last modified.
   */
  lastModifiedOn?: Date;
}
