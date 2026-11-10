import { EmptyState } from "@avplatform/ui";
import { ScrollArea } from "@avplatform/ui/scroll";
import { Tabs, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import NewAgentIcon from "@/components/NewAgentIcon";
import NewChatIcon from "@/components/NewChatIcon";
import {
  SEGMENTED_TABS_LIST_CLASS,
  SEGMENTED_TABS_TRIGGER_CLASS,
} from "@/components/segmented-tabs.constant";
import { useIsMobile } from "@/hooks/useIsMobile";

import { AssistChatDto } from "../../dtos/assist-chat-dto";
import { ChatAgentListItem } from "./ChatAgentListItem";

interface ChatAgentsListProps {
  data: AssistChatDto[];
  tab: string;
  setTab: (tab: string) => void;
  mode: string;
}

export default function ChatAgentsList({ data: agents, setTab, tab, mode }: ChatAgentsListProps) {
  const { flowVersionId, conversationId } = useParams<{
    flowVersionId?: string;
    conversationId?: string;
  }>();
  const isMobile = useIsMobile();

  // Changed: Set initial state to null so it does not auto-expand on load
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleToggle = (id: string, isOpen: boolean) => {
    setExpandedId(isOpen ? id : null);
  };

  // Keyboard Navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, currentIndex: number) => {
    if (!listRef.current) return;
    const rows = Array.from(listRef.current.querySelectorAll('[tabindex="0"]')) as HTMLElement[];

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % rows.length;
      rows[nextIndex]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + rows.length) % rows.length;
      rows[prevIndex]?.focus();
    }
  };

  useEffect(() => {
    if (!agents.length) {
      navigate(`${mode === "popover" ? "/external" : "/assist"}/chats`, {
        replace: true,
      });
      return;
    }

    // If a chat is already selected in the URL, do nothing
    if (flowVersionId) return;

    //  Do not auto-redirect on mobile screens!
    if (isMobile || mode == "popover") return;

    // Desktop auto-redirect logic
    const agentWithChats = agents.find((a) => a.conversations && a.conversations.length > 0);

    if (agentWithChats) {
      navigate(
        `${mode === "popover" ? "/external" : "/assist"}/chats/${agentWithChats.id}/${agentWithChats.conversations[0].id}`,
        { replace: true },
      );
    } else if (agents.length > 0) {
      navigate(`${mode === "popover" ? "/external" : "/assist"}/chats/${agents[0].id}`, {
        replace: true,
      });
    }
  }, [agents, flowVersionId, navigate, isMobile, mode]);

  return (
    <div className="flex flex-col h-full select-none">
      {agents.length == 0 && (
        <div className="h-full">
          <EmptyState
            primaryMessage={tab === "archived" ? "No archived conversations" : "No agents assigned"}
            secondaryMessage={
              tab === "archived"
                ? "Conversations you archive will appear here."
                : "Contact your admin to get agents assigned to you."
            }
            Icon={tab === "archived" ? NewChatIcon : NewAgentIcon}
            className="h-full"
          />
        </div>
      )}
      <ScrollArea
        className="flex-1 p-2 [&_[data-radix-scroll-area-viewport]>div]:!block [&_[data-radix-scroll-area-viewport]>div]:!w-full"
        ref={listRef}
      >
        <div className="space-y-1 h-full">
          {agents?.map((agent, index) => (
            <ChatAgentListItem
              key={agent.id}
              agent={agent}
              isExpanded={expandedId === agent.id}
              isSelected={agent.id === flowVersionId} // ADDED: Passes route sync info
              onToggle={(isOpen) => handleToggle(agent.id, isOpen)}
              activeConversationId={conversationId}
              onKeyDown={(e) => handleKeyDown(e, index)}
              mode={mode}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="p-2 border-t">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "active" | "archived")}>
          <TabsList className={`${SEGMENTED_TABS_LIST_CLASS} w-full`}>
            <TabsTrigger value="active" className={`${SEGMENTED_TABS_TRIGGER_CLASS} w-full`}>
              Active
            </TabsTrigger>
            <TabsTrigger value="archived" className={`${SEGMENTED_TABS_TRIGGER_CLASS} w-full`}>
              Archived
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
