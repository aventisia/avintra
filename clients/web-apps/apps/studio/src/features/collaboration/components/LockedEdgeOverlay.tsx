import { useCollaborationStore } from "../stores/collaboration-store";
import { LockHolderBadge } from "./LockHolderBadge";

interface LockedEdgeOverlayProps {
  edgeId: string;
}

/**
 * Visual marker rendered on an edge that is locked by another user.
 */
export const LockedEdgeOverlay = ({ edgeId }: LockedEdgeOverlayProps) => {
  const edgeLock = useCollaborationStore((state) =>
    Object.values(state.locks).find((l) => l.targetId === edgeId && l.targetType === "Edge"),
  );

  if (!edgeLock) return null;

  return <LockHolderBadge lock={edgeLock} />;
};
