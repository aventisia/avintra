import { ChatSidebarHistory } from "@avplatform/chat";

import { useHomeChatHistoryPanel } from "../hooks/useHomeChatHistoryPanel.hook";
import { HomeChatProjectDialog } from "./HomeChatProjectDialog";

/** The user's Home chats as a section of the expanded app sidebar. */
export const HomeChatSidebarSection = () => {
  const { props, editingProjectId, closeProjectDialog } = useHomeChatHistoryPanel();
  return (
    <>
      <ChatSidebarHistory {...props} />
      <HomeChatProjectDialog projectId={editingProjectId} onClose={closeProjectDialog} />
    </>
  );
};
