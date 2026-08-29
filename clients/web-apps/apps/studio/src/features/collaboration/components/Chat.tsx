import { cn } from "@avplatform/ui/lib";
import { PopoverContent, PopoverDefaultHeader } from "@avplatform/ui/popover";
import { PopoverWrapper } from "@avplatform/ui/popover";
import { useShallow } from "zustand/react/shallow";

import { useCollaborationStore } from "../stores/collaboration-store";
import { ChatPanel } from "./chat/ChatPanel";
import { ChatTrigger } from "./chat/ChatTrigger";

const CHAT_HEADING = "Live Chat";

interface ChatProps {
  /** Additional class name to override popover content container style */
  className?: string;
}

/**
 * Renders the live chat popover for collaborators in the current flow. Messages are
 * ephemeral (held only in the collaboration store) and disappear when the agent is
 * closed. Opening the panel clears the unread badge.
 */
export const Chat = ({ className }: ChatProps) => {
  const { isChatOpen, setChatOpen } = useCollaborationStore(
    useShallow((state) => ({
      isChatOpen: state.isChatOpen,
      setChatOpen: state.setChatOpen,
    })),
  );

  return (
    <PopoverWrapper
      open={isChatOpen}
      onOpenChangeFn={() => {
        // Opening the panel does NOT wipe unread here — ChatPanel marks the active
        // conversation via setActiveConversation, which clears only that conversation's
        // unread. This keeps unread counts for other conversations intact across
        // open/close so the dropdown badges persist.
        setChatOpen(!isChatOpen);
      }}
    >
      <ChatTrigger />
      <PopoverContent align="end" variant="responsive" className={cn(className)}>
        <PopoverDefaultHeader heading={CHAT_HEADING} />
        <ChatPanel />
      </PopoverContent>
    </PopoverWrapper>
  );
};
