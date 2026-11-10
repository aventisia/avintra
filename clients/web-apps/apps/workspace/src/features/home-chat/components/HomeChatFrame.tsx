import { ChatIconButton } from "@avplatform/chat";
import { Dialog, DialogContent, DialogTitle } from "@avplatform/ui/dialog";
import { NotePencilIcon, SidebarSimpleIcon } from "@phosphor-icons/react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { HOME_CHAT_HISTORY_OPEN_STORAGE_KEY } from "../constants/home-chat.constant";
import { useMediaQuery } from "../hooks/useMediaQuery.hook";

const readStoredRailOpen = () => {
  const isLargeScreen = () => window.matchMedia("(min-width: 1280px)").matches;
  try {
    const stored = localStorage.getItem(HOME_CHAT_HISTORY_OPEN_STORAGE_KEY);
    return stored === null ? isLargeScreen() : stored === "true";
  } catch {
    return isLargeScreen();
  }
};

const storeRailOpen = (isOpen: boolean) => {
  try {
    localStorage.setItem(HOME_CHAT_HISTORY_OPEN_STORAGE_KEY, String(isOpen));
  } catch {
    // Without storage the rail opens by viewport width next time.
  }
};

export type HomeChatHistoryControls = {
  /** Hides the history: collapses the rail, or closes the sheet. */
  close: () => void;
  /** Closes the sheet after opening a chat; the rail stays put. */
  dismissSheet: () => void;
};

type HomeChatFrameProps = {
  renderHistory: (controls: HomeChatHistoryControls) => ReactNode;
  onNewChat: () => void;
  children: ReactNode;
};

/**
 * Home's frame: the history rail beside the thread from 1024px (open by
 * default from 1280px, then as the user left it), a sheet over it below, and
 * ⌘⇧O / Ctrl+Shift+O for a new chat.
 */
export const HomeChatFrame = ({ renderHistory, onNewChat, children }: HomeChatFrameProps) => {
  const isWide = useMediaQuery("(min-width: 1024px)");
  const [isRailOpen, setIsRailOpen] = useState(readStoredRailOpen);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const toggleRail = (isOpen: boolean) => {
    setIsRailOpen(isOpen);
    storeRailOpen(isOpen);
  };
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
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const showsRail = isWide && isRailOpen;
  const dismissSheet = () => setIsSheetOpen(false);

  return (
    <div className="flex h-full min-h-0">
      {showsRail && (
        <aside className="w-[17rem] shrink-0 border-r border-line bg-sunken/60 dark:bg-surface">
          {renderHistory({ close: () => toggleRail(false), dismissSheet })}
        </aside>
      )}
      {!isWide && (
        <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <DialogContent
            side="left"
            aria-describedby={undefined}
            onOpenAutoFocus={(event) => {
              // Focusing the sheet itself keeps the close button's tooltip and the mobile keyboard closed.
              event.preventDefault();
              (event.currentTarget as HTMLElement).focus();
            }}
            className="w-[19rem] max-w-[85vw] p-0 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] max-md:w-full max-md:max-w-none max-md:rounded-none"
          >
            <DialogTitle className="sr-only">Chat history</DialogTitle>
            {renderHistory({ close: dismissSheet, dismissSheet })}
          </DialogContent>
        </Dialog>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {!showsRail && (
          <div className="flex h-12 shrink-0 items-center gap-1 px-2 sm:px-3">
            <ChatIconButton
              label="Open chat history"
              onClick={() => (isWide ? toggleRail(true) : setIsSheetOpen(true))}
            >
              <SidebarSimpleIcon />
            </ChatIconButton>
            <ChatIconButton label="New chat" onClick={startNewChat}>
              <NotePencilIcon />
            </ChatIconButton>
          </div>
        )}
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
};
