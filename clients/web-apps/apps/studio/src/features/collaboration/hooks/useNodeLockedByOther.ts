import { useUserSessionStore } from "@avplatform/ui/stores";

import { LockDto, LockTargetType } from "@/features/collaboration/dtos/collaboration-dtos";
import { useCollaborationStore } from "@/features/collaboration/stores/collaboration-store";

/**
 * Returns whether the given node is locked by another collaborator, plus the lock
 * itself. Nodes that render outside `NodeContainer` (e.g. branch nodes) use this to
 * show the lock overlay and block interaction, matching regular node behavior.
 */
export const useNodeLockedByOther = (nodeId: string) => {
  const userEmail = useUserSessionStore((state) => state.userSession?.email);
  const nodeLock = useCollaborationStore((state) =>
    Object.values(state.locks).find(
      (l) => l.targetId === nodeId && l.targetType === LockTargetType.Node,
    ),
  ) as LockDto | undefined;

  const lockedByOther = !!nodeLock && nodeLock.holderUserId !== userEmail;

  return { nodeLock, lockedByOther };
};

