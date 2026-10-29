import { Separator } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ArchiveIcon, ArrowLeftIcon, SquarePenIcon } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useIsMobile } from "@/hooks/useIsMobile";
import { AvPlatformAssistantUI } from "@/react-toolkit/features/av-platform-assistant-ui/components/AvPlatformAssistantUI";

import { useArchiveConversationMutation } from "../hooks/useArchiveConversationMutation";
import { useFetchChatAgents } from "../hooks/useFetchChatAgents";
import { AgentIcon } from "./chat-agents-list/AgentIcon";

type LayoutMode = "page" | "popover";

export default function ChatSection({ mode = "page" }: { mode?: LayoutMode }) {
  const isMobile = useIsMobile();

  const layoutMode = mode === "popover" || isMobile ? "stacked" : "split";

  const { flowVersionId, conversationId } = useParams();

  const navigate = useNavigate();

  const { mutate: archiveConversation } = useArchiveConversationMutation();

  /**
   * Subscribe to the chat agents query cache.
   * This component will rerender whenever these queries are invalidated/refetched.
   */
  const { active, archived } = useFetchChatAgents();

  const activeAgents = active.data;

  const archivedAgents = archived.data;

  /**
   * Find the current flow data from either agent list.
   */
  const flowData = useMemo(() => {
    return (
      activeAgents?.data?.find((item) => item.id === flowVersionId) ||
      archivedAgents?.data?.find((item) => item.id === flowVersionId)
    );
  }, [activeAgents, archivedAgents, flowVersionId]);

  /**
   * Check whether the current conversation is archived.
   */
  const isArchived = useMemo(() => {
    if (!flowVersionId || !conversationId) {
      return false;
    }

    return (
      archivedAgents?.data
        ?.find((item) => item.id === flowVersionId)
        ?.conversations?.find((c) => c.id === conversationId)?.status === "Archived"
    );
  }, [archivedAgents, flowVersionId, conversationId]);

  /**
   * Derived agent metadata for display.
   */
  const agentMeta = useMemo(
    () => ({
      name: flowData?.name ?? "",
      description: flowData?.description ?? "",
      version: flowData?.versionNumber ?? 0,
    }),
    [flowData],
  );

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  /**
   * Navigate to a fresh conversation thread.
   * Removing the conversation ID must also reset the assistant runtime.
   */
  const handleNewConversation = () => {
    if (!flowVersionId) return;

    navigate(`${mode === "popover" ? "/external" : "/assist"}/chats/${flowVersionId}`, {
      replace: true,
    });
  };

  /**
   * Handle a newly allocated conversation.
   */
  const handleAllocation = (newId: string) => {
    navigate(`/assist/chats/${flowVersionId}/${newId}`, {
      replace: true,
    });
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* HEADER */}
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

          {/* AGENT INFO */}
          <AgentIcon active />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{agentMeta.name}</span>

              <Badge variant="outline" className="tabular-nums">
                v{agentMeta.version}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 pr-2">
              {agentMeta.description}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        {conversationId && !isArchived && (
          <div className="flex flex-row-reverse items-center gap-1 justify-center">
            <Tooltip content="New conversation">
              <Button variant="ghost" size="icon7" onClick={handleNewConversation}>
                <SquarePenIcon className="h-4 w-4" />
              </Button>
            </Tooltip>

            <Separator orientation="vertical" className="h-5 w-[0.5px]" />

            <Tooltip content="Archive conversation">
              <Button
                variant="ghost"
                size="icon7"
                onClick={() => {
                  if (conversationId) {
                    archiveConversation(conversationId);
                  }
                }}
              >
                <ArchiveIcon className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        )}
      </div>

      {/* CHAT */}
      <div className="h-[calc(100%-4rem)] w-full">
        <AvPlatformAssistantUI
          title={`Hello${userSession?.firstName ? `, ${userSession.firstName}` : ""}`}
          archived={isArchived}
          flowVersionId={flowVersionId || ""}
          conversationId={conversationId}
          defaultActions={flowData?.defaultActions ?? []}
          mode="production"
          onConversationAllocated={handleAllocation}
        />
      </div>
    </div>
  );
}
