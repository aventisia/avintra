import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/react-toolkit/ui/collapsible";

import { Badge } from "@aventisia/ui/badge";
import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import { AssistChatDto } from "../../dtos/assist-chat-dto";
import { AgentIcon } from "./AgentIcon";
import { ConversationListItem } from "./ConversationListItem";

// import { useInsertConversationMutation } from "../../hooks/useInsertConversationMutation";

interface ChatAgentListItemProps {
  agent: AssistChatDto;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: (open: boolean) => void;
  activeConversationId?: string;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  mode: string;
}

export function ChatAgentListItem({
  agent,
  isExpanded,
  isSelected,
  onToggle,
  activeConversationId,
  onKeyDown,
  mode,
}: ChatAgentListItemProps) {
  const navigate = useNavigate();
  const rowRef = useRef<HTMLDivElement>(null);

  // const { mutate: insertNewConversation } = useInsertConversationMutation();

  const handleBodyClick = () => {
    if (agent.conversations.length > 0) {
      navigate(
        `${mode === "popover" ? "/external" : "/assist"}/chats/${agent.id}/${agent.conversations[0].id}`,
      );
    } else {
      // insertNewConversation(agent.id)
      navigate(
        `${mode === "popover" ? "/external" : "/assist"}/chats/${agent.id}`,
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleBodyClick();
  };

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={onToggle}
      className="flex relative flex-col"
    >
      {/* Continuous Timeline */}
      {isExpanded && (
        <div className="pointer-events-none absolute left-9 bottom-0 top-[4.5rem] w-0.5 rounded-full bg-neutral-200" />
      )}

      {/* Main Agent Button (Navigates). Styles now react to isSelected, not isExpanded */}
      <div
        ref={rowRef}
        tabIndex={0}
        onKeyDown={(e) => {
          handleKeyPress(e);
          onKeyDown(e);
        }}
        onClick={handleBodyClick}
        className={cn(
          "group flex relative items-center justify-between px-4 py-3.5 w-full text-left transition-colors rounded-xl cursor-pointer outline-none focus-visible:bg-accent",
          isSelected ? "bg-accent" : "hover:bg-accent",
        )}
      >
        <div className="flex flex-1 items-center gap-3 overflow-hidden">
          {/* Icon reacts to isSelected */}
          <AgentIcon active={isSelected} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p
                className={cn(
                  "text-sm font-semibold truncate ",
                  isSelected ? "text-primary" : "text-gray-800", // Text color reacts to isSelected
                )}
              >
                {agent.name}
              </p>
              <Badge className="px-2 py-0 rounded-full text-2xs bg-slate-200 text-secondary font-medium">
                v{agent.versionNumber}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 pr-2">
              {agent.description}
            </p>
          </div>
        </div>

        {/* The Expand/Collapse Trigger (Toggles List) */}
        {agent?.conversations?.length > 1 && (
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon7"
              className="w-8 h-8  flex-shrink-0 text-gray-400 hover:text-gray-700 hover:bg-black/5"
              onClick={(e) => e.stopPropagation()}
            >
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isExpanded && "rotate-180",
                )}
              />
              <span className="sr-only">Toggle conversations</span>
            </Button>
          </CollapsibleTrigger>
        )}
      </div>

      <CollapsibleContent className="bg-white data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
        {agent.conversations.map((conv) => (
          <ConversationListItem
            key={conv.id}
            conversation={conv}
            flowVersionId={agent.id}
            isActive={conv.id === activeConversationId}
            mode={mode}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
