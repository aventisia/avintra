/**
 * Represents a data transfer object (DTO) for a flow comment.
 */
export interface FlowCommentDto {
  /**
   * The record's primary key in Guid (globally unique identifier) format.
   */
  id: string;

  /**
   * The ID of the flow this comment is associated with.
   */
  flowId: string;

  /**
   * The flow comment which could be plain text or rich text or html. Max-500.
   */
  comment: string;

  /**
   * The user's full name who posted the comment.
   */
  userFullName?: string;

  /**
   * The username (A unique identifier) of the user who posted the comment.
   */
  userName?: string;

  /**
   * The user's avatar image URL (if available) of the user who posted the comment.
   */
  avatarSrc?: string;

  /**
   * The user's initials of the user who posted the comment.
   */
  initials?: string;

  /**
   * When the comment was created.
   */
  createdOn?: Date;

  /**
   * A value indicating whether the comment has been edited.
   */
  isEdited?: boolean;
}
