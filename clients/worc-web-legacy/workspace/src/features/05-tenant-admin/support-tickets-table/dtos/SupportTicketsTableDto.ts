import { SupportTicketRemarksDto } from "./SupportTicketRemarksDto";

/**
 * Represents a data transfer object (DTO) for a support ticket.
 */
export interface SupportTicketsTableDto {
  /**
   * Gets or sets the SupportTicket record's primary key
   */
  id: string;

  /**
   * Gets or sets the ticket number associated with support ticket
   */
  ticketNumber?: string;

  /**
   * Gets or sets the Brief summary of the issue related to the ticket. Max-255
   */
  subject: string;

  /**
   * Gets or sets the description of the support ticket. Min-100, Max-500
   */
  description: string;

  /**
   * Gets or sets the priority level of the ticket (e.g., low, medium, high, critical).
   */
  priority?: string;

  /**
   * Gets or sets the current status of the ticket (e.g., open, inProgress, resolved, closed).
   */
  status?: string;

  /**
   * Gets or sets the number of remarks associated with the support ticket.
   */
  remarkCount?: number;

  /**
   * Gets or sets a flag indicating whether the supportTicket record is disabled.
   *
   * It's important to have this property nullable because we need to differentiate between true, false, and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the supportTicket record.
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the supportTicket record was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the supportTicket record.
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the supportTicket record was last modified.
   */
  lastModifiedOn?: Date;

  /**
   * Gets or sets the support ticket remarks associated with the support ticket.
   */
  supportTicketRemarks?: SupportTicketRemarksDto[];
}
