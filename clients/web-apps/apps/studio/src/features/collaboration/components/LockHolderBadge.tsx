import { LockIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { LockDto } from "../dtos/collaboration-dtos";
import { useCollaborationStore } from "../stores/collaboration-store";
import {
  collaborationColorMapForPresence,
  collaborationTextColorFor,
} from "../utils/collaboration-color";
import { getInitials } from "../utils/get-initials";

interface LockHolderBadgeProps {
  lock: LockDto;
}

/**
 * Badge rendered on a locked node/edge. Shows a lock icon plus the holder's
 * initials, tinted with the holder's collaboration color so it visually matches
 * their presence avatar. The full name is kept in the tooltip.
 */
export const LockHolderBadge = ({ lock }: LockHolderBadgeProps) => {
  const presence = useCollaborationStore(useShallow((state) => state.presence));

  // Prefer the collision-free color map (built from presence) so the badge matches
  // the holder's avatar ring; fall back to a deterministic per-user color.
  const colorMap = collaborationColorMapForPresence(presence);
  const textColor =
    colorMap[lock.holderUserId]?.text ?? collaborationTextColorFor(lock.holderUserId);

  const displayName = lock.holderDisplayName ?? "another user";
  const initials = getInitials(lock.holderDisplayName);

  return (
    <div
      className="pointer-events-none flex items-center gap-1 rounded-md border border-line bg-surface/90 px-2 py-1 text-[10px] font-semibold text-ink-2 shadow-pop"
      title={`Locked by ${displayName}`}
    >
      <LockIcon className={`h-3 w-3 ${textColor}`} />
      <span className="max-w-24 truncate uppercase tracking-wide">{initials}</span>
    </div>
  );
};
