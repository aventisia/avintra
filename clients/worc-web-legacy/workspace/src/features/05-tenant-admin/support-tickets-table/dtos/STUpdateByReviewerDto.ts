/**
 * Represents a data transfer object (DTO) for a support ticket status update by a reviewer.
 */
export interface STUpdateByReviewerDto {
  /**
   * Gets or sets the SupportTicket record's primary key
   */
  ticketId: string;

  /**
   * Gets or sets the ticket number associated with support ticket
   */
  ticketNumber?: string;

  /**
   * Gets or sets the current status of the ticket (e.g., open, inProgress, resolved, closed).
   */
  status?: string;
}
