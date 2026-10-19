/** User item returned by the tenant user search. */
export type SearchedUser = {
  /** User primary key. */
  id: string;

  /** User name (login handle). */
  userName: string;

  /** User's first name. */
  firstName: string;

  /** User's last name. */
  lastName: string;

  /** User's avatar (profile pic) source. */
  avatarSrc?: string | null;
};
