import { Avatar, AvatarFallback } from "@avplatform/ui/avatar";
import { cn } from "@avplatform/ui/lib";

import { ChatMessageDto } from "../../dtos/collaboration-dtos";
import { useCollaborationStore } from "../../stores/collaboration-store";
import { collaborationColorMapForPresence } from "../../utils/collaboration-color";
import { getInitials } from "../../utils/get-initials";

interface ChatMessageBubbleProps {
  message: ChatMessageDto;
  /** Whether this message was sent by the local user. */
  isOwn: boolean;
}

/**
 * Renders a single chat message row with the sender's initials avatar (tinted with
 * their collaboration color) and the message text. Own messages are right-aligned.
 */
export const ChatMessageBubble = ({ message, isOwn }: ChatMessageBubbleProps) => {
  const presence = useCollaborationStore((state) => state.presence);
  const colorMap = collaborationColorMapForPresence(presence);
  const ringColor = colorMap[message.senderUserId ?? ""]?.border ?? "border-line-strong";

  const senderName = message.senderDisplayName ?? message.senderEmail ?? "Unknown";
  const initials = getInitials(message.senderDisplayName, message.senderEmail);

  return (
    <div className={cn("flex items-start gap-2", isOwn && "flex-row-reverse")}>
      <Avatar className={`h-6 w-6 shrink-0 rounded-full border-2 ${ringColor} bg-sunken`}>
        <AvatarFallback className="border-none bg-sunken text-[9px] font-bold uppercase tracking-wider text-ink-2">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className={cn("flex max-w-[75%] flex-col", isOwn && "items-end")}>
        <span className="mb-0.5 px-1 text-[10px] font-medium text-muted-foreground">
          {isOwn ? "You" : senderName}
        </span>
        <div
          className={cn(
            "rounded-lg px-2.5 py-1.5 text-xs leading-snug",
            isOwn
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm bg-sunken text-ink",
          )}
        >
          {message.message}
        </div>
      </div>
    </div>
  );
};
