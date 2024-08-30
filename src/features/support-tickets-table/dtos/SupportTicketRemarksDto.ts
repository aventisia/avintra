/**
 * Represents a data transfer object (DTO) for a support ticket remark.
 */
export interface SupportTicketRemarksDto {
  /**
   * Gets or sets the SupportTicketRemark record's primary key
   */
  id: string;

  /**
   * Gets or sets the Foreign key referencing the associated support ticket.
   * Links the response to the ticket.
   */
  supportTicketId: string;

  /**
   * Gets or sets the SupportTicket number associated support ticket remark.
   */
  ticketNumber?: string;

  /**
   * Gets or sets the content of the message (text) within the conversation. Min-1, Max-500
   */
  message: string;

  /**
   * Gets or sets the user's unique identifier who posted the remark.
   */
  userId: string;

  /**
   * Gets or sets the user's full name who posted the remark.
   */
  userFullName?: string;

  /**
   * Gets or sets the username (A unique identifier) of the user who posted the remark.
   */
  userName?: string;

  /**
   * Gets or sets the user's avatar image URL (if available) of the user who posted the remark.
   */
  avatarSrc?: string;

  /**
   * Gets or sets the user's initials of the user who posted the remark.
   */
  initials?: string;

  /**
   * Gets or sets a value indicating whether the remark has been edited.
   */
  isEdited?: boolean;

  /**
   * Gets or sets a value indicating whether the remark is disabled.
   * It's important to have this property nullable because we need to differentiate between true, false, and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the user's unique identifier who last modified the remark.
   */
  createdBy?: string;

  /**
   * Gets or sets when the remark was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the remark record.
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the remark record was last modified.
   */
  lastModifiedOn?: Date;
}
