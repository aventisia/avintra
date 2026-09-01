import { cn } from "@avplatform/ui/lib";

import { useCollaborationStore } from "../stores/collaboration-store";
import { LockHolderBadge } from "./LockHolderBadge";

interface LockedNodeOverlayProps {
  nodeId: string;
  /** Optional extra classes. Pass `rounded-full` for circular nodes (e.g. Call Agent / Call Block). */
  className?: string;
}

/**
 * Overlay rendered on a node that is locked by another user. Prevents interaction
 * and shows who holds the lock.
 */
export const LockedNodeOverlay = ({ nodeId, className }: LockedNodeOverlayProps) => {
  // The store is keyed by full lockKey; find the node lock by targetId.
  const nodeLock = useCollaborationStore((state) =>
    Object.values(state.locks).find((l) => l.targetId === nodeId && l.targetType === "Node"),
  );

  if (!nodeLock) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-slate-900/40",
        className,
      )}
    >
      <LockHolderBadge lock={nodeLock} />
    </div>
  );
};
