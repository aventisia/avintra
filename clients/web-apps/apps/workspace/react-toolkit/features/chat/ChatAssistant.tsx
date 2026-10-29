import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";

import NewChatIcon from "@/components/NewChatIcon";

interface ChatAssistantProps {
  className?: string;
}

const ChatAssistant = ({ className }: ChatAssistantProps) => {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "fixed bottom-4 z-50 right-4 hidden h-[3.1rem] w-[3.1rem] items-center justify-center rounded-full text-primary-foreground shadow-pop msm:flex xs:bg-primary",
          className,
        )}
      >
        <NewChatIcon className="h-6 w-6" />
      </PopoverTrigger>
      <PopoverContent align="end" className="border rounded-lg h-[35rem] overflow-hidden w-[25rem]">
        <iframe
          className="h-[35rem]  w-[25rem]"
          src={`${window.location.origin}/workspace/external/chats`}
        />
      </PopoverContent>
    </Popover>
  );
};

export { ChatAssistant };
