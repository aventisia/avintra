import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { useLocation, useNavigate } from "react-router-dom";

import NewChatIcon from "@/components/NewChatIcon";
import {
  HOME_CHAT_CONVERSATION_ROUTE,
  HOME_CHAT_SHARED_ROUTE,
  useIsHomeChatAvailable,
} from "@/features/home-chat";

interface ChatAssistantProps {
  className?: string;
}

const triggerClassName =
  "fixed bottom-4 z-50 right-4 hidden h-[3.1rem] w-[3.1rem] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-pop msm:flex";

const ChatAssistant = ({ className }: ChatAssistantProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isHomeChatAvailable = useIsHomeChatAvailable();

  // IMPORTANT NOTE: on Home chat pages the bubble only repeats the page and covers the composer.
  const isOnHomeChat =
    pathname === "/" ||
    pathname.startsWith(`${HOME_CHAT_CONVERSATION_ROUTE}/`) ||
    pathname.startsWith(`${HOME_CHAT_SHARED_ROUTE}/`);

  if (isHomeChatAvailable) {
    if (isOnHomeChat) return null;

    return (
      <button
        type="button"
        aria-label="New AI chat"
        className={cn(triggerClassName, className)}
        onClick={() => navigate("/")}
      >
        <NewChatIcon className="h-6 w-6" />
      </button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger className={cn(triggerClassName, className)}>
        <NewChatIcon className="h-6 w-6" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="h-[35rem] w-[25rem] overflow-hidden rounded-lg border border-line bg-surface p-0"
      >
        <iframe
          className="h-[35rem]  w-[25rem]"
          src={`${window.location.origin}/workspace/external/chats`}
        />
      </PopoverContent>
    </Popover>
  );
};

export { ChatAssistant };
