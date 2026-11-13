/** The signed-in user's custom instructions and memory notes for every Home chat. */
export interface UserChatProfileDto {
  /** How the assistant should respond, at most 1500 characters. */
  customInstructions: string;

  /** Facts to remember across chats, at most 4000 characters. */
  memoryNotes: string;
}
