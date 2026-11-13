/** Route prefix of a saved Home conversation, `/c/:conversationId`. */
export const HOME_CHAT_CONVERSATION_ROUTE = "/c";

/** Route prefix of a shared Home conversation, `/s/:shareToken`. */
export const HOME_CHAT_SHARED_ROUTE = "/s";

export const HOME_CHAT_HISTORY_QUERY_KEY = ["home-chat-history"] as const;

export const HOME_CHAT_HISTORY_PAGE_SIZE = 30;

export const HOME_CHAT_PROJECTS_QUERY_KEY = ["home-chat-projects"] as const;

/** localStorage key remembering whether the history rail is open. */
export const HOME_CHAT_HISTORY_OPEN_STORAGE_KEY = "home-chat-history-open";

export const HOME_CHAT_FILES_QUERY_KEY = ["home-chat-files"] as const;

export const HOME_CHAT_FILE_QUERY_KEY = ["home-chat-file"] as const;
