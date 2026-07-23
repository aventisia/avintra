import { cn } from "@avplatform/ui/lib";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

import { ConversationSummaryDto } from "../../dtos/conversation-summary-dto";

export function ConversationListItem({
  conversation,
  flowVersionId,
  isActive,
  mode,
}: {
  conversation: ConversationSummaryDto;
  flowVersionId: string;
  isActive: boolean;
  mode: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="relative ml-9 mt-1 w-[calc(100%-2.5rem)] last:mb-0.5">
      {isActive && (
        <div className="pointer-events-none absolute -left-[1px] top-1 h-[calc(100%-0.5rem)] w-1 rounded-full bg-[#1e1b6e]" />
      )}
      <button
        onClick={() =>
          navigate(
            `${mode === "popover" ? "/external" : "/assist"}/chats/${flowVersionId}/${conversation.id}`,
          )
        }
        className={cn(
          "w-[calc(100%-1rem)] text-left ml-2 px-4 rounded-lg py-2.5 transition-colors focus-visible:bg-[#f0f0f8] focus-visible:ring-0",
          isActive ? "bg-[#f0f0f8]" : "hover:bg-[#f0f0f8]",
        )}
      >
        <p
          className={cn(
            "text-xs font-semibold leading-snug line-clamp-1 overflow-hidden break-all",
            isActive && "text-primary",
          )}
        >
          {conversation.title}
        </p>
        <p className="text-[0.65rem] text-muted-foreground mt-0.5">
          {conversation.timestamp ? format(conversation.timestamp, "dd MMM yyyy, h:mm a") : "NA"}
        </p>
      </button>
    </div>
  );
}
