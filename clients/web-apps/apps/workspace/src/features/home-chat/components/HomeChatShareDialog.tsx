import { useRef } from "react";

import { ShareLinkDialog } from "@/components/share-link-dialog/ShareLinkDialog";

import { useHomeChatHistoryActions } from "../hooks/useHomeChatHistoryActions.hook";
import type { HomeChatActiveChat } from "../types/home-chat-active-chat.type";

type HomeChatShareDialogProps = {
  chat: HomeChatActiveChat | null;
  onClose: () => void;
};

/** Shares a Home chat by a read-only link, or stops sharing it. */
export const HomeChatShareDialog = ({ chat, onClose }: HomeChatShareDialogProps) => {
  const { createShareLink, stopSharing } = useHomeChatHistoryActions();
  const lastChat = useRef(chat);
  if (chat) lastChat.current = chat;
  const shown = chat ?? lastChat.current;

  if (!shown) return null;
  return (
    <ShareLinkDialog
      key={shown.id}
      open={chat !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      kind="chat"
      name={shown.title}
      isShared={shown.isShared}
      createLink={() => createShareLink(shown.id)}
      stopSharing={() => stopSharing(shown.id)}
    />
  );
};
