import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@avplatform/ui/components/collapsible";
import { cn } from "@avplatform/ui/lib";
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
      navigate(`${mode === "popover" ? "/external" : "/assist"}/chats/${agent.id}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleBodyClick();
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle} className="flex relative flex-col">
      {/* Continuous Timeline */}
      {isExpanded && (
        <div className="pointer-events-none absolute left-9 bottom-0 top-[4.5rem] w-0.5 rounded-full bg-fill" />
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
          "group flex relative items-center justify-between px-4 py-3.5 w-full text-left transition-colors rounded-md cursor-pointer outline-none focus-visible:bg-hover",
          isSelected ? "bg-selected" : "hover:bg-hover",
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
                  isSelected ? "text-primary-text" : "text-ink", // Text color reacts to isSelected
                )}
                title={agent.name}
              >
                {agent.name}
              </p>
              <Badge variant="outline" className="tabular-nums">
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
              className="w-8 h-8  ml-1 flex-shrink-0 text-muted-foreground hover:text-ink-2 hover:bg-hover"
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

      <CollapsibleContent className="bg-surface data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
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
