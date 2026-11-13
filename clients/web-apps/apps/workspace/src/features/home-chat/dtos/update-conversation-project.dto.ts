/** Files a Home chat under a project, or ungroups it when the project is null. */
export interface UpdateConversationProjectDto {
  /** Unique identifier of the conversation. */
  id: string;

  /** Unique identifier of the project, or null to ungroup. */
  projectId: string | null;
}
