import { LockIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { useCollaborationStore } from "../stores/collaboration-store";

/**
 * Banner shown when a flow-level action (publish/delete/restore) is locked by
 * another user, so the current user knows the action is blocked.
 */
export const FlowActionLockBanner = () => {
  const flowVersionId = useCurrentFlowStore((state) => state.currentFlow.versionId);
  const flowActionLocks = useCollaborationStore(useShallow((state) => state.flowActionLocks));

  const lock = flowVersionId ? flowActionLocks[`${flowVersionId}:Publish`] : undefined;
  if (!lock) return null;

  return (
    <div className="pointer-events-none absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-2 rounded-md border border-warn/40 bg-surface px-3 py-1.5 text-xs font-medium text-ink shadow-pop">
      <LockIcon className="h-3.5 w-3.5 text-warn" />
      <span>
        {lock.holderDisplayName ?? "Another user"} is publishing this agent. Publishing is
        temporarily blocked.
      </span>
    </div>
  );
};
