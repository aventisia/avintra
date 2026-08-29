import { useCollaborationStore } from "../stores/collaboration-store";
import { LockHolderBadge } from "./LockHolderBadge";

interface LockedNodeOverlayProps {
  nodeId: string;
}

/**
 * Overlay rendered on a node that is locked by another user. Prevents interaction
 * and shows who holds the lock.
 */
export const LockedNodeOverlay = ({ nodeId }: LockedNodeOverlayProps) => {
  // The store is keyed by full lockKey; find the node lock by targetId.
  const nodeLock = useCollaborationStore((state) =>
    Object.values(state.locks).find(
      (l) => l.targetId === nodeId && l.targetType === "Node",
    ),
  );

  if (!nodeLock) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-slate-900/40">
      <LockHolderBadge lock={nodeLock} />
    </div>
  );
};
