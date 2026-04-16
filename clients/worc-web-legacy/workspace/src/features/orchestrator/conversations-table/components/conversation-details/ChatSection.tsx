import { WorcAssistantUI } from "@/features/assist/my-chats/assistant-ui";
import { AgentIcon } from "@/features/assist/my-chats/components/chat-agents-list/AgentIcon";

import { ThreadMessageLike } from "@assistant-ui/react";
import { Badge } from "@aventisia/ui/badge";

import { AdminConversationDto } from "../../dtos/conversations-table-dto";

export default function ChatSection({ data }: { data: AdminConversationDto }) {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="px-3 h-16 min-h-16 max-h-16 border-b flex items-center justify-between">
        <div className="flex items-center gap-3 justify-center">
          {/* Icon */}
          <AgentIcon active />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={"text-sm font-semibold"}>{data.flowName}</span>
              <Badge className="px-2 py-0 rounded-full text-2xs bg-slate-200 text-secondary font-medium">
                v{data.versionNumber}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[calc(100%-4rem)] w-full">
        <WorcAssistantUI
          readOnly
          initialMessages={
            data?.messages?.map((a, i) => {
              return {
                content: a.content,
                role: i % 2 == 0 ? "user" : "assistant",
              };
            }) as unknown as ThreadMessageLike[]
          }
        />
      </div>
    </div>
  );
}
