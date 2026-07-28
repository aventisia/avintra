import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

interface ChatAssistantProps {
  className?: string;
}

const ChatAssistant = ({ className }: ChatAssistantProps) => {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "fixed bottom-4 right-4 hidden h-[3.1rem] w-[3.1rem] items-center justify-center rounded-full text-white shadow msm:flex xs:bg-primary",
          className,
        )}
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="hidden h-[calc(100vh-(3rem))] w-screen flex-col overflow-hidden rounded-t-lg border-t msm:flex mlg:h-[65vh] mlg:w-[26rem] mlg:rounded-lg mlg:border"
      ></PopoverContent>
    </Popover>
  );
};

export { ChatAssistant };
