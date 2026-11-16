export type ConversationIdAllocatorInput = {
  /** Conversation the thread already belongs to, if any. */
  conversationId?: string;
  /** Creates the conversation on the server and resolves its id. */
  createConversation: () => Promise<string>;
  /** Called once with the id of a conversation this allocator created. */
  onConversationCreated?: (conversationId: string) => void;
};

/**
 * Builds the model adapter's `getConversationId`: it creates the conversation on
 * the first send that asks for one, and never more than once per thread.
 */
export const createConversationIdAllocator = ({
  conversationId,
  createConversation,
  onConversationCreated,
}: ConversationIdAllocatorInput) => {
  let currentId = conversationId;
  let pending: Promise<string> | undefined;

  return async (allocateIfMissing: boolean): Promise<string | undefined> => {
    if (currentId || !allocateIfMissing) return currentId;
    pending ??= createConversation()
      .then((createdId) => {
        currentId = createdId;
        onConversationCreated?.(createdId);
        return createdId;
      })
      .finally(() => {
        pending = undefined;
      });
    return pending;
  };
};
