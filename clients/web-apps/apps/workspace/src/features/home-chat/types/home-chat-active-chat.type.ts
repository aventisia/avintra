import type { ChatHistoryItem } from "@avplatform/chat";

/** The open chat as the title bar needs it, whether it came from history or was fetched by ID. */
export type HomeChatActiveChat = Pick<ChatHistoryItem, "id" | "title">;
