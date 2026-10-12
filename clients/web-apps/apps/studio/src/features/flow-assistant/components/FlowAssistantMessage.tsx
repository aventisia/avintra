import { cn } from "@avplatform/ui/lib";

import { FlowAssistantMessage as FlowAssistantMessageType } from "../types/flow-assistant-message-type";

type FlowAssistantMessageProps = {
  message: FlowAssistantMessageType;
};

export const FlowAssistantMessage = ({ message }: FlowAssistantMessageProps) => {
  const isUser = message.role === "user";
  if (!isUser && message.content.trim().length === 0) return null;

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-xs leading-relaxed",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
          message.variant === "error" && "bg-destructive/10 text-destructive",
        )}
      >
        {message.content}
      </div>
    </div>
  );
};
