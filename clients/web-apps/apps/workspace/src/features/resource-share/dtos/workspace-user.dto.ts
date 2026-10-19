/**
 * Represents a data transfer object (DTO) for Workspace User.
 */
export interface WorkspaceUserDto {
  id: string;

  userName?: string;

  firstName: string;

  lastName: string;

  avatarSrc?: string | null;
}
