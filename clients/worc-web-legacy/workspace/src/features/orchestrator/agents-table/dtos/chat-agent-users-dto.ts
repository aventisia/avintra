export interface ChatAgentUserDto {
  /** Unique identifier for the chatAgent user */
  id?: string;

  /** Unique identifier for the user associated with the chatAgent */
  userId?: string;

  /** FirstName of the user that the chatAgent is associated with */
  firstName?: string | null;

  /** LastName of the user that the chatAgent is associated with */
  lastName?: string | null;

  /** Name of the user that the chatAgent is associated with */
  username?: string | null;

  /** Intial of the user that the chatAgent is associated with */
  createdByUserInitials?: string | null;

  /** Unique identifier for the chatAgent that the user belongs to */
  flowVersionId: string;

  /** Name of the chatAgent that the user is associated with */
  name?: string | null;

  isAssignedToAllUsers?: boolean;
  versionNumber?: number;
}
