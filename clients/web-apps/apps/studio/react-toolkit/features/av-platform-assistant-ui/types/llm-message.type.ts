/**
 * Represents the message structure for LLM chat models.
 */
export type LLMMessageType = {
  /**
   * Role of the message sender.
   */
  role: "system" | "developer" | "user" | "assistant";

  /**
   * Content of the message.
   */
  content: string;
};
