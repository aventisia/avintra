import { useIsMobile } from "@/hooks/useIsMobile";
import { AvPlatformAssistantUI } from "@/react-toolkit/features/av-platform-assistant-ui/components/AvPlatformAssistantUI";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { Separator } from "@aventisia/ui";
import { Badge } from "@aventisia/ui/badge";
import { Button } from "@aventisia/ui/buttons";
import { Tooltip } from "@aventisia/ui/tooltip";
import { useQueryClient } from "@tanstack/react-query";
import { ArchiveIcon, ArrowLeftIcon, SquarePenIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { AssistChatDto } from "../dtos/assist-chat-dto";
import { useArchiveConversationMutation } from "../hooks/useArchiveConversationMutation";
// import { useInsertConversationMutation } from "../hooks/useInsertConversationMutation";
import { AgentIcon } from "./chat-agents-list/AgentIcon";

type LayoutMode = "page" | "popover";

export default function ChatSection({ mode = "page" }: { mode?: LayoutMode }) {
  const isMobile = useIsMobile();

  const layoutMode = mode === "popover" || isMobile ? "stacked" : "split";
  const { flowVersionId, conversationId } = useParams();
  const [isArchived, setArchived] = useState(false);

  const [agentMeta, setAgentMeta] = useState({
    name: "",
    description: "",
    version: 0,
  });
  const navigate = useNavigate();
  // const { mutate: insertNewConversation } = useInsertConversationMutation();
  const { mutate: archiveConversation } = useArchiveConversationMutation();
  // Get query client
  const queryClient = useQueryClient();

  useEffect(() => {
    // Get chat agents data from query client
    const activeAgents = queryClient.getQueryData<{
      data: AssistChatDto[];
    }>(["chat-agents", "active"]);

    const archivedAgents = queryClient.getQueryData<{
      data: AssistChatDto[];
    }>(["chat-agents", "archived"]);
    // Get flow data by id
    const flowData =
      activeAgents?.data.find((item) => item.id === flowVersionId) ||
      archivedAgents?.data.find((item) => item.id === flowVersionId);
    if (flowData) {
      console.log(flowData);
      const convo = archivedAgents?.data
        .find((item) => item.id === flowVersionId)
        ?.conversations?.find((c) => c.id == conversationId);
      if (convo) {
        console.log(convo);
        setArchived(convo.status == "Archived");
      }
      setAgentMeta({
        name: flowData?.name ?? "",
        description: flowData?.description ?? "",
        version: flowData?.versionNumber ?? 0,
      });
    }
    return () => {
      setArchived(false);
    };
  }, [conversationId, flowVersionId, queryClient]);
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
      setUserSession: state.setUserSession,
    })),
  );

  // Handle the callback when the component allocates a new session in the DB
  const handleAllocation = (newId: string) => {
    navigate(`/assist/chats/${flowVersionId}/${newId}`, { replace: true });
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="px-3 h-16 min-h-16 max-h-16 border-b flex items-center justify-between">
        <div className="flex items-center gap-3 justify-center">
          {/* MOBILE BACK BUTTON */}
          {layoutMode === "stacked" && (
            <Button
              variant="ghost"
              size="icon7"
              className="mr-1"
              onClick={() => navigate("/external/chats")}
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          )}

          {/* Icon */}
          <AgentIcon active />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={"text-sm font-semibold"}>{agentMeta.name}</span>
              <Badge className="px-2 py-0 rounded-full text-2xs bg-slate-200 text-secondary font-medium">
                v{agentMeta.version}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 pr-2">
              {agentMeta.description}
            </p>
          </div>
        </div>
        {conversationId && !isArchived && (
          <div className=" flex flex-row-reverse items-center gap-1 justify-center ">
            <Tooltip content="New Conversation">
              <Button
                variant={"ghost"}
                size={"icon7"}
                onClick={() => {
                  if (flowVersionId)
                    navigate(
                      `${mode === "popover" ? "/external" : "/assist"}/chats/${flowVersionId}`,
                      { replace: true },
                    );
                }}
              >
                <SquarePenIcon className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Separator orientation="vertical" className="h-5 w-[0.5px]" />
            <Tooltip content="Archive Conversation">
              <Button
                variant={"ghost"}
                size={"icon7"}
                onClick={() => {
                  if (conversationId) archiveConversation(conversationId);
                }}
              >
                <ArchiveIcon className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        )}
      </div>

      <div className="h-[calc(100%-4rem)] w-full">
        <AvPlatformAssistantUI
          title={`Hello${userSession?.firstName ? ", " + userSession?.firstName : ""}`}
          archived={isArchived}
          flowVersionId={flowVersionId || ""}
          conversationId={conversationId}
          mode="production"
          onConversationAllocated={handleAllocation}
        />
      </div>
    </div>
  );
}
