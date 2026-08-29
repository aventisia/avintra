import { Avatar, AvatarFallback } from "@avplatform/ui/avatar";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ViewportPortal } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

import { useUserSessionStore } from "@avplatform/ui/stores";

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
 * Renders a live cursor for every collaborator currently moving on the canvas.
 * Cursors are positioned in flow coordinates and rendered through React Flow's
 * {@link ViewportPortal}, which portals into the transformed viewport so cursors
 * stay under the corresponding location as the user pans/zooms. The local user's
 * own cursor is excluded. Each cursor is colored to match its owner's presence
 * avatar. Must be rendered as a child of <ReactFlow>.
 */
export const RemoteCursors = () => {
  const cursors = useCollaborationStore(
    useShallow((state) => Object.values(state.cursors)),
  );
  const presence = useCollaborationStore(
    useShallow((state) => state.presence),
  );

  // Same per-user color map as the header avatars, so a user's cursor color always
  // matches their presence avatar ring color.
  const colorMap = collaborationColorMapForPresence(presence);

  const localEmail = useUserSessionStore((state) => state.userSession?.email);

  // Exclude our own cursor(s) (a user can have multiple tabs/connections).
  const remoteCursors = cursors.filter((c) => c.email !== localEmail);

  if (remoteCursors.length === 0) return null;

  return (
    <ViewportPortal>
      {remoteCursors.map((c) => {
        const key = c.connectionId ?? c.userId;
        const displayName = c.displayName ?? c.email ?? "Collaborator";
        const colorClass = colorMap[c.userId]?.border ?? "border-gray-300";
        const fillClass = colorMap[c.userId]?.fill ?? "fill-gray-300";
        return (
          <div
            key={key}
            className="pointer-events-none absolute z-20"
            style={{
              left: c.x,
              top: c.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <Tooltip content={displayName}>
              <div className="relative">
                {/* Cursor arrow */}
                <svg
                  className={`h-4 w-4 ${fillClass}`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4 2l7 18 2.5-7.5L21 10 4 2z" />
                </svg>
                {/* Initials-only bubble (name kept in the tooltip) */}
                <div className="absolute left-4 top-0 flex items-center rounded-full border bg-white p-0.5 shadow-sm">
                  <Avatar className={`h-5 w-5 rounded-full border-2 ${colorClass}`}>
                    <AvatarFallback className="text-[7px] font-bold uppercase">
                      {getInitials(c.displayName, c.email)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </Tooltip>
          </div>
        );
      })}
    </ViewportPortal>
  );
};
