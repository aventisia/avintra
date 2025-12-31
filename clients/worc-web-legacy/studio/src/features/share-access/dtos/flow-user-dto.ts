/**
 * Represents a data transfer object (DTO) for Flow User.
 */

export type UserType = "View" | "Edit" | "Owner";

export interface FlowUserDto {
  id?: string;

  type: UserType; // TODO: Update enum values

  flowId: string;

  userId: string;

  userFullName?: string;

  userName?: string;

  avatarSrc?: string;

  initials?: string;

  createdOn?: Date;
}
