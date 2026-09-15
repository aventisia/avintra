import { Avatar, AvatarFallback, AvatarImage } from "@avplatform/ui/avatar";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { Tooltip } from "@avplatform/ui/tooltip";
import { useShallow } from "zustand/react/shallow";

import { useCollaborationStore } from "../stores/collaboration-store";
import { collaborationColorMapForPresence } from "../utils/collaboration-color";

const getInitials = (name?: string, email?: string) => {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return parts[0]?.slice(0, 2).toUpperCase() ?? "?";
  }
  return email?.slice(0, 2).toUpperCase() ?? "?";
};

/**
 * Renders a stack of avatars for all users currently present in the flow. Styled to
 * match the workspace top-bar avatar (circular with an outline); each user gets a distinct
 * colored ring. Intended to be placed in the studio header bar.
 */
export const PresenceAvatars = () => {
  const presence = useCollaborationStore(useShallow((state) => state.presence));

  // Color per user is derived from the presence list so each user is unique and the
  // header avatar matches the canvas cursor color for the same user.
  const colorMap = collaborationColorMapForPresence(presence);

  // Current user's avatar url (only the local user has their own avatar available).
  const localAvatarSrc = useUserSessionStore((state) => state.userSession?.avatarSrc);
  const localEmail = useUserSessionStore((state) => state.userSession?.email);

  if (presence.length === 0) return null;

  // Dedupe by user (email, falling back to userId) so a user with multiple connections
  // (e.g. a lingering presence entry after navigating away and back) shows only one
  // avatar. Presence is keyed by connection id server-side, so the same user can appear
  // more than once in the list.
  const seen = new Set<string>();
  const uniquePresence = presence.filter((p) => {
    const key = p.email ?? p.userId;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <div className="hidden md:flex items-center -space-x-2">
      {uniquePresence.map((p) => {
        const displayName = p.displayName ?? p.email ?? "Collaborator";
        const avatarSrc = p.email && p.email === localEmail ? localAvatarSrc : undefined;
        const ringColor = colorMap[p.userId]?.border ?? "border-gray-300";
        return (
          <Tooltip key={p.connectionId ?? p.userId} content={displayName}>
            <Avatar className={`h-7 w-7 rounded-full border-[2px] ${ringColor} bg-primary-200`}>
              {avatarSrc ? <AvatarImage src={avatarSrc} alt={displayName} /> : null}
              <AvatarFallback className="border-none bg-primary-200 text-[10px] font-bold uppercase tracking-wider text-secondary">
                {getInitials(p.displayName, p.email)}
              </AvatarFallback>
            </Avatar>
          </Tooltip>
        );
      })}
    </div>
  );
};
