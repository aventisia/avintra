/**
 * Represents a data transfer object for a custom UI builder project user assignment.
 */
export interface UiBuilderUserDto {
  /** Unique identifier for the UI builder project user. */
  id?: string;

  /** Unique identifier for the user associated with the project. */
  userId?: string;

  /** First name of the user associated with the project. */
  firstName?: string | null;

  /** Last name of the user associated with the project. */
  lastName?: string | null;

  /** Username of the user associated with the project. */
  username?: string | null;

  /** Initials of the user associated with the project. */
  initials?: string | null;

  /** Unique identifier for the UI builder project. */
  uiBuilderProjectId: string;

  /** Indicates whether the project is assigned to all team members. */
  isAssignedToAllUsers?: boolean;

  /** Name of the UI builder project. */
  name?: string | null;

  /** Number of the newest generated version for the project. */
  headVersionNumber?: number;
}
