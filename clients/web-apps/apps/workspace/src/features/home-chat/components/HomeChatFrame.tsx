import { ChatIconButton } from "@avplatform/chat";
import { Dialog, DialogContent, DialogTitle } from "@avplatform/ui/dialog";
import {
  ChatsCircleIcon,
  KeyboardIcon,
  NotePencilIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { useMediaQuery } from "../hooks/useMediaQuery.hook";
import { HomeChatShortcutsDialog } from "./HomeChatShortcutsDialog";

type HomeChatFrameProps = {
  /** The chat history for the phone-width sheet; wider screens list chats in the app sidebar. */
  renderHistory: (close: () => void) => ReactNode;
  onNewChat: () => void;
  /** Shown in the bar above the thread, such as the open chat's title. */
  header?: ReactNode;
  /** Extra buttons shown at the end of the bar, before the shortcut and preference buttons. */
  actions?: ReactNode;
  /** Opens chat preferences from a button at the end of the bar. */
  onOpenPreferences?: () => void;
  children: ReactNode;
};

/**
 * Home's frame: a bar with the open chat's title above the thread, and
 * ⌘⇧O / Ctrl+Shift+O for a new chat, and ⌘/ / Ctrl+/ for the shortcut list. Below 768px, where the app sidebar is a
 * menu sheet, the bar also opens the chat history as its own sheet, which closes on navigation.
 */
export const HomeChatFrame = ({
  renderHistory,
  onNewChat,
  header,
  actions,
  onOpenPreferences,
  children,
}: HomeChatFrameProps) => {
  const hasAppSidebar = useMediaQuery("(min-width: 768px)");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [areShortcutsOpen, setAreShortcutsOpen] = useState(false);
  const { key: locationKey } = useLocation();

  useEffect(() => setIsSheetOpen(false), [locationKey]);

  const startNewChat = () => {
    setIsSheetOpen(false);
    onNewChat();
  };
  const startNewChatRef = useRef(startNewChat);
  startNewChatRef.current = startNewChat;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "o") {
        event.preventDefault();
        startNewChatRef.current();
      } else if ((event.metaKey || event.ctrlKey) && event.key === "/") {
        event.preventDefault();
        setAreShortcutsOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex h-full min-h-0">
      {!hasAppSidebar && (
        <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <DialogContent
            side="left"
            aria-describedby={undefined}
            onOpenAutoFocus={(event) => {
              // Focusing the sheet itself keeps the close button's tooltip and the mobile keyboard closed.
              event.preventDefault();
              (event.currentTarget as HTMLElement).focus();
            }}
            className="w-full max-w-none rounded-none p-0 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
          >
            <DialogTitle className="sr-only">Chat history</DialogTitle>
            {renderHistory(() => setIsSheetOpen(false))}
          </DialogContent>
        </Dialog>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center gap-1 bg-surface px-2 dark:bg-bg sm:px-3">
          {!hasAppSidebar && (
            <>
              <ChatIconButton label="Open chat history" onClick={() => setIsSheetOpen(true)}>
                <ChatsCircleIcon />
              </ChatIconButton>
              <ChatIconButton label="New chat" onClick={startNewChat}>
                <NotePencilIcon />
              </ChatIconButton>
            </>
          )}
          {header}
          <div className="ml-auto flex items-center gap-1">
            {actions}
            <ChatIconButton label="Keyboard shortcuts" onClick={() => setAreShortcutsOpen(true)}>
              <KeyboardIcon />
            </ChatIconButton>
            {onOpenPreferences && (
              <ChatIconButton label="Chat preferences" onClick={onOpenPreferences}>
                <SlidersHorizontalIcon />
              </ChatIconButton>
            )}
          </div>
        </div>
        <div className="min-h-0 flex-1">{children}</div>
      </div>
      <HomeChatShortcutsDialog open={areShortcutsOpen} onOpenChange={setAreShortcutsOpen} />
    </div>
  );
};
