import { useDocumentTitle } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";

import { HelpButton } from "@/components/help/HelpButton";
import { useIsMobile } from "@/hooks/useIsMobile";

import { useFetchChatAgents } from "../hooks/useFetchChatAgents";
import { NoAgentsAvailable } from "./NoAgentsAvailable";
import ChatAgentsList from "./chat-agents-list/ChatAgentsList";
import { SearchCommandDialog } from "./search/componets";
import SearchCommandTrigger from "./search/componets/Search";

type LayoutMode = "page" | "popover";

export function MyChatsLayout({ mode = "page" }: { mode?: LayoutMode }) {
  //Set Title
  useDocumentTitle("Chats - Assist");
  const isMobile = useIsMobile();

  const layoutMode = mode === "popover" || isMobile ? "stacked" : "split";
  const defaultTab = "active";
  const [tabValue, setTabValue] = useState(defaultTab);

  const handleTabSelect = (tab: string) => {
    setTabValue(tab);
  };

  // Detect if a chat is currently active in the URL
  const { flowVersionId, conversationId } = useParams();
  const isChatActive = !!flowVersionId;

  const navigate = useNavigate();

  const { active, archived } = useFetchChatAgents();

  const activeAgents = useMemo(() => active.data?.data ?? [], [active.data?.data]);

  const archivedAgents = useMemo(() => archived.data?.data ?? [], [archived.data?.data]);
  useEffect(() => {
    if (!conversationId) return;

    // Check in ACTIVE agents
    const existsInActive = activeAgents.some((agent) =>
      agent.conversations?.some((c) => c.id === conversationId),
    );

    if (existsInActive) {
      setTabValue("active");
      return;
    }

    //  Check in ARCHIVED agents
    const existsInArchived = archivedAgents.some((agent) =>
      agent.conversations?.some((c) => c.id === conversationId),
    );

    if (existsInArchived) {
      setTabValue("archived");
    }
  }, [conversationId, activeAgents, archivedAgents]);

  const visibleAgents = tabValue === "active" ? activeAgents : archivedAgents;

  const isLoading = tabValue === "active" ? active.isLoading : archived.isLoading;

  const HAS_AGENTS = activeAgents.length > 0 || archivedAgents.length > 0;

  // Handle selection when TAB changes
  useEffect(() => {
    if (!visibleAgents.length) return;

    // If current conversation already belongs to this tab → do nothing
    const exists = visibleAgents.some((agent) =>
      agent.conversations?.some((c) => c.id === conversationId),
    );

    if (exists || layoutMode === "stacked") return;

    // Otherwise select first available conversation
    const agentWithChats = visibleAgents.find((a) => a.conversations && a.conversations.length > 0);

    if (agentWithChats) {
      const firstConvo = agentWithChats.conversations[0];

      navigate(`/assist/chats/${agentWithChats.id}/${firstConvo.id}`, {
        replace: true,
      });
    } else {
      navigate(`/assist/chats/${visibleAgents[0].id}`, {
        replace: true,
      });
    }
  }, [tabValue]); //  ONLY on tab change

  const showList = layoutMode === "split" || (layoutMode === "stacked" && !isChatActive);

  const showChat = layoutMode === "split" || (layoutMode === "stacked" && isChatActive);
  const containerHeight =
    mode === "popover" ? "h-full " : "h-[calc(100vh-2.5*var(--header-height))]";

  return (
    <div
      className={cn(
        "space-y-4  md:py-4 h-full  flex flex-col",
        layoutMode === "stacked" && "h-screen space-y-2 ",
      )}
    >
      {/* Header - hide on mobile if chat is active so chat takes full screen */}
      {layoutMode !== "stacked" && (
        <div className={cn("w-full flex items-center justify-between")}>
          <div className="flex items-center gap-2">
            <p className="text-lg font-medium">Chats</p>
            <HelpButton guideId="assist-chats" />
          </div>
          {HAS_AGENTS && <SearchCommandTrigger />}
        </div>
      )}
      {isLoading ? (
        <NoAgentsAvailable /> //TODO: add skeleton
      ) : !HAS_AGENTS ? (
        <NoAgentsAvailable />
      ) : (
        <>
          <div
            className={cn(
              "w-full border flex bg-background rounded-lg  overflow-hidden",
              containerHeight,
            )}
          >
            {/* LEFT: Agent List */}
            {/* Hidden on mobile if a chat is active. Always visible on md (desktop). */}
            <div
              className={cn(
                "w-full md:w-[30%] lg:w-[25%] md:border-r flex-shrink-0 flex flex-col",
                !showList && "hidden",
              )}
            >
              <ChatAgentsList
                data={visibleAgents}
                setTab={handleTabSelect}
                tab={tabValue}
                mode={mode}
              />
            </div>

            {/* RIGHT: Chat Window */}
            {/* Hidden on mobile if NO chat is active. Always visible on md. */}
            <div
              className={cn(
                "w-full md:w-[70%] lg:w-[75%] flex-shrink-0 flex flex-col",
                !showChat && "hidden",
              )}
            >
              {/* If on desktop and no chat is selected, Outlet will be null. You can render a fallback here if desired. */}
              <Outlet />
            </div>
          </div>
          <SearchCommandDialog />
        </>
      )}
    </div>
  );
}
