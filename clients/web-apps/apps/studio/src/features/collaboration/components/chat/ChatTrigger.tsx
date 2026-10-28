import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { PopoverTrigger } from "@avplatform/ui/popover";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { useCollaborationStore } from "../../stores/collaboration-store";

const CHAT_HEADING = "Live Chat";

/**
 * Renders the header trigger for the live chat popover, with an unread-count badge
 * that appears when new messages arrive while the panel is closed.
 */
export const ChatTrigger = () => {
  const { isChatOpen, unreadCount, setChatOpen } = useCollaborationStore(
    useShallow((state) => ({
      isChatOpen: state.isChatOpen,
      unreadCount: state.unreadCount,
      setChatOpen: state.setChatOpen,
    })),
  );

  return (
    <Tooltip content={CHAT_HEADING}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon8" }),
          "relative hover:bg-hover",
          isChatOpen && "hidden bg-fill md:flex",
        )}
        onClick={() => setChatOpen(!isChatOpen)}
      >
        <ChatBubbleLeftRightIcon className="h-[1.1rem] w-[1.1rem] text-ink-2" />
        {unreadCount > 0 && !isChatOpen ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-bad px-1 text-[9px] font-bold leading-none text-bad-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </PopoverTrigger>
    </Tooltip>
  );
};
