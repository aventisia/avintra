import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { ChatsIcon } from "@phosphor-icons/react";

interface ChatAssistantProps {
  className?: string;
}

const ChatAssistant = ({ className }: ChatAssistantProps) => {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "fixed bottom-4 right-4 hidden h-[3.1rem] w-[3.1rem] items-center justify-center rounded-full text-primary-foreground shadow-pop msm:flex xs:bg-primary",
          className,
        )}
      >
        <ChatsIcon className="h-6 w-6" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="hidden h-[calc(100vh-(3rem))] w-screen flex-col overflow-hidden rounded-t-lg border-t msm:flex mlg:h-[65vh] mlg:w-[26rem] mlg:rounded-lg mlg:border"
      ></PopoverContent>
    </Popover>
  );
};

export { ChatAssistant };
