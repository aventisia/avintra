/**
 * Represents the base user DTO returned from the accounts API.
 * Mirrors the backend AspNetToolkit AppUserBaseDto.
 */
export interface AppUserBaseDto {
  /** User primary key. */
  id: string;

  /** User login/email. */
  userName: string;

  /** User first name. */
  firstName: string;

  /** User last name. */
  lastName: string;

  /** User avatar source. */
  avatarSrc?: string | null;
}
