/** Route prefix of a saved Home conversation, `/c/:conversationId`. */
export const HOME_CHAT_CONVERSATION_ROUTE = "/c";

/** Composer draft key of a new Home chat; text saved under it shows up in the next new chat. */
export const HOME_CHAT_NEW_DRAFT_KEY = "home:new";

/** Search parameter that opens a new Home chat as temporary, `/?temporary=1`. */
export const HOME_CHAT_TEMPORARY_PARAM = "temporary";

/** Route prefix of a shared Home conversation, `/s/:shareToken`. */
export const HOME_CHAT_SHARED_ROUTE = "/s";

export const HOME_CHAT_HISTORY_QUERY_KEY = ["home-chat-history"] as const;

export const HOME_CHAT_CONVERSATION_QUERY_KEY = ["home-chat-conversation"] as const;

export const HOME_CHAT_HISTORY_PAGE_SIZE = 30;

export const HOME_CHAT_SHARED_CHATS_QUERY_KEY = ["home-chat-shared-chats"] as const;

export const HOME_CHAT_PROJECTS_QUERY_KEY = ["home-chat-projects"] as const;

export const HOME_CHAT_PROJECT_FILES_QUERY_KEY = ["home-chat-project-files"] as const;

export const HOME_CHAT_FILES_QUERY_KEY = ["home-chat-files"] as const;

export const HOME_CHAT_FILE_QUERY_KEY = ["home-chat-file"] as const;
