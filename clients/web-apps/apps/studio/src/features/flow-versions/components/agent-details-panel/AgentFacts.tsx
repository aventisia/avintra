import { CopyableText } from "@avplatform/ui";
import { KeyIcon } from "@phosphor-icons/react";

import { useCurrentFlowStore } from "@/stores/current-flow-store";

const OWNER_ACCESS = "Owner";

/**
 * The viewer's access to the agent and its copyable ID, pinned below the scrolling details.
 */
export const AgentFacts = () => {
  const { id, accessType } = useCurrentFlowStore((state) => state.currentFlow);

  return (
    <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-line bg-surface px-4 py-2.5 text-hint">
      {accessType ? (
        <span className="flex min-w-0 items-center gap-1.5 text-ink-2">
          <KeyIcon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {accessType === OWNER_ACCESS ? "You own this agent" : `${accessType} access`}
          </span>
        </span>
      ) : (
        <span />
      )}
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="shrink-0 text-muted-foreground">ID</span>
        <CopyableText
          value={id}
          className="min-w-0 max-w-[10.5rem]"
          textClassName="font-mono text-hint text-ink-2"
        />
      </span>
    </footer>
  );
};
