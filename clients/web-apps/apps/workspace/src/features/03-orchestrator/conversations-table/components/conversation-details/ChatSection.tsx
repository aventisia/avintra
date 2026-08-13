import { ThreadMessageLike } from "@assistant-ui/react";
import { Badge } from "@avplatform/ui/badge";

import { AgentIcon } from "@/features/04-assist/my-chats/components/chat-agents-list/AgentIcon";
import { AvPlatformAssistantUI } from "@/react-toolkit/features/av-platform-assistant-ui/components/AvPlatformAssistantUI";

import { AdminConversationDto } from "../../dtos/conversations-table-dto";

/**
 * Reconstructs assistant-ui thread message parts from a persisted message.
 * Tool calls are stored in `metadata.tool_calls` (written by llmpipeline), so
 * the read-only view can render them as tool-call parts instead of losing them.
 */
function mapMessageToThreadMessage(a: {
  content: string;
  role: string;
  metadata?: Record<string, unknown> | null;
}): ThreadMessageLike {
  const role = a.role.toLowerCase() as ThreadMessageLike["role"];
  const content: any[] = [];

  if (a.content) {
    content.push({ type: "text", text: a.content });
  }

  const toolCalls = (a.metadata?.tool_calls as any[]) || [];
  if (Array.isArray(toolCalls)) {
    toolCalls.forEach((tc, i) => {
      content.push({
        type: "tool-call",
        toolCallId: tc?.id || `tool-${i}`,
        toolName: tc?.name || "tool",
        argsText: JSON.stringify(tc?.args || {}),
        args: tc?.args || {},
      });
    });
  }

  return { content, role } as ThreadMessageLike;
}

export default function ChatSection({ data }: { data: AdminConversationDto }) {
  // map conversation messages with thread message
  const messages = data?.messages?.map(mapMessageToThreadMessage) ?? [];

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
        <AvPlatformAssistantUI flowVersionId="" readOnly={true} initialMessages={messages} />
      </div>
    </div>
  );
}
