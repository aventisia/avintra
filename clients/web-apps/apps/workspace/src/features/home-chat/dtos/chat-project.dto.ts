/** A project the user can file Home chats under. */
export interface ChatProjectDto {
  /** Unique identifier of the project. */
  id: string;

  /** Name shown in the history filter. */
  name: string;

  /** Instructions applied to every chat in the project. */
  instructions: string | null;
}

/** A text file attached to a project. */
export interface ChatProjectFileDto {
  id: string;
  name: string;
  sizeBytes: number;
}

/** The name and text of a file to attach to a project. */
export interface InsertChatProjectFileDto {
  name: string;
  content: string;
}
