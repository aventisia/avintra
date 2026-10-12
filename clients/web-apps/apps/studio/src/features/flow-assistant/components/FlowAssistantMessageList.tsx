import { ThinkingIndicator } from "@avplatform/assistant-chat";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useEffect, useRef } from "react";

import { FLOW_ASSISTANT_COPY } from "../constants";
import { useFlowAssistantStore } from "../stores/flow-assistant-store";
import { FlowAssistantMessage } from "./FlowAssistantMessage";

export const FlowAssistantMessageList = () => {
  const messages = useFlowAssistantStore((state) => state.messages);
  const isStreaming = useFlowAssistantStore((state) => state.isStreaming);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages.length, isStreaming]);

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div ref={scrollRef} className="flex flex-col gap-2.5 px-3 py-3">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            {FLOW_ASSISTANT_COPY.emptyState}
          </p>
        ) : (
          messages.map((message) => <FlowAssistantMessage key={message.id} message={message} />)
        )}
        {isStreaming && <ThinkingIndicator className="px-1" />}
      </div>
    </ScrollArea>
  );
};
