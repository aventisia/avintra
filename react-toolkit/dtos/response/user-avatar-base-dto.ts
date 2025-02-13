/**
 * Represents the data structure for a user avatar.
 */
export interface UserAvatarBaseDto {
  /** Username, A unique identifier for user */
  userName: string;

  /** User's avatar image url */
  avatarSrc: string;

  /** User's initials */
  initials: string;
}
