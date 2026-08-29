import { Avatar, AvatarFallback } from "@avplatform/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import { UsersIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { useUserSessionStore } from "@avplatform/ui/stores";

import { useCollaborationStore } from "../../stores/collaboration-store";
import { collaborationColorMapForPresence } from "../../utils/collaboration-color";
import { getInitials } from "../../utils/get-initials";

export interface ChatRecipient {
  /** Unique key for the conversation (null = group chat). */
  key: string;
  /** Display label shown in the select. */
  label: string;
  /** The user id to send to, or null for the group conversation. */
  recipientUserId?: string;
}

interface ChatRecipientSelectProps {
  value: string;
  onChange: (recipient: ChatRecipient) => void;
}

/**
 * Lets the user pick who to chat with: the group conversation (everyone in the flow)
 * or a specific live user. Rendered as a dropdown with each recipient's avatar
 * initials so the user can identify collaborators at a glance.
 */
export const ChatRecipientSelect = ({ value, onChange }: ChatRecipientSelectProps) => {
  const presence = useCollaborationStore(
    useShallow((state) => state.presence),
  );
  const unreadByConversation = useCollaborationStore(
    useShallow((state) => state.unreadByConversation),
  );
  const localEmail = useUserSessionStore((state) => state.userSession?.email);

  const colorMap = collaborationColorMapForPresence(presence);

  const recipients: ChatRecipient[] = [
    { key: "group", label: "Everyone in this flow" },
    ...presence
      .filter((p) => p.email !== localEmail)
      .map((p) => ({
        // Key the conversation by email (the chat identity) so it matches the
        // sender/recipient emails used in ChatPanel and the unread handler. Using the
        // presence Guid here would mismatch the email-based comparisons.
        key: p.email ?? p.userId,
        label: p.displayName ?? p.email ?? "Collaborator",
        recipientUserId: p.email ?? p.userId,
      })),
  ];

  const active = recipients.find((r) => r.key === value) ?? recipients[0];

  const handleChange = (key: string) => {
    const next = recipients.find((r) => r.key === key);
    if (next) onChange(next);
  };

  return (
    <div className="flex items-center gap-2 border-b px-3 py-2">
      <UsersIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <Select value={active.key} onValueChange={handleChange}>
        <SelectTrigger size="sm" className="h-8 w-full">
          <SelectValue>{active.label}</SelectValue>
        </SelectTrigger>
        <SelectContent className="w-[var(--radix-select-trigger-width)]">
          {recipients.map((r) => {
            const presenceUser = presence.find((p) => p.email === r.key);
            const ringColor = presenceUser
              ? colorMap[presenceUser.userId]?.border ?? "border-gray-300"
              : "border-gray-300";
            const unread = unreadByConversation[r.key] ?? 0;
            return (
              <SelectItem key={r.key} value={r.key} size="sm">
                <div className="flex w-full items-center gap-2">
                  {r.recipientUserId ? (
                    <Avatar className={`h-5 w-5 rounded-full border-2 ${ringColor} bg-primary-200`}>
                      <AvatarFallback className="border-none bg-primary-200 text-[8px] font-bold uppercase text-secondary">
                        {getInitials(presenceUser?.displayName, presenceUser?.email)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                      #
                    </span>
                  )}
                  <span className="grow truncate">{r.label}</span>
                  {unread > 0 ? (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold leading-none text-white">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  ) : null}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};
