import { ChatSidebarHistory } from "@avplatform/chat";

import { useHomeChatHistoryPanel } from "../hooks/useHomeChatHistoryPanel.hook";

/** The user's Home chats as a section of the expanded app sidebar. */
export const HomeChatSidebarSection = () => {
  const { props } = useHomeChatHistoryPanel();
  return <ChatSidebarHistory {...props} />;
};
