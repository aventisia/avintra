/**
 * Represents a data transfer object (DTO) for Flow User.
 */

export type UserType = "View" | "Edit" | "Owner";

export interface FlowUserDto {
  id?: string;

  accessType: UserType; // TODO: Update enum values

  mlModelId: string;

  userId: string;

  userFullName?: string;

  userName?: string;

  avatarSrc?: string;

  initials?: string;

  createdOn?: Date;
}
