import { HOME_CHAT_SHARED_ROUTE } from "../constants/home-chat.constant";

const buildSharedLink = (path: string) =>
  `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}${HOME_CHAT_SHARED_ROUTE}/${path}`;

/** Absolute URL of the read-only page for a shared Home conversation. */
export const buildSharedChatLink = (shareToken: string) => buildSharedLink(shareToken);

/** Absolute URL of the read-only page for a shared chat file. */
export const buildSharedFileLink = (shareToken: string) => buildSharedLink(`file/${shareToken}`);
