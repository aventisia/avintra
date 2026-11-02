import { cn } from "@avplatform/ui/lib";

import { LockedNodeOverlay } from "@/features/collaboration/components/LockedNodeOverlay";
import { useNodeLockedByOther } from "@/features/collaboration/hooks/useNodeLockedByOther";
import { NodeDataType } from "@/types/node-data-type";

import { NodeCard, NodeCardContent, getNodeKind } from "./NodeCard";
import { OpenNodeConfig } from "./node-header/OpenNodeConfig";
import { NodeRunState, useNodeRunState } from "./useNodeRunState";

interface NodeContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  nodeId: string;
  nodeData: NodeDataType;
  selected?: boolean;
  glyph: React.ReactNode;
  kind?: React.ReactNode;
  /** Overrides the run state resolved from the execution stores. */
  runState?: NodeRunState;
}

export const NodeContainer = ({
  nodeId,
  nodeData,
  selected = false,
  glyph,
  kind,
  runState,
  className,
  children,
  ...props
}: NodeContainerProps) => {
  const resolvedRunState = useNodeRunState(nodeId, nodeData?.isDisabled);
  const state = runState ?? resolvedRunState;

  // Collaboration: a node locked by another user is non-interactive and shows an overlay.
  const { lockedByOther } = useNodeLockedByOther(nodeId);

  return (
    <NodeCard
      runState={state}
      selected={selected}
      className={cn(
        !!nodeData?.groupId && "border-ink-2",
        className,
        nodeData?.isDisabled && "opacity-50",
        nodeData?.isCut && "border-dashed border-bad opacity-60",
        lockedByOther && "pointer-events-none opacity-70",
      )}
      {...props}
    >
      <OpenNodeConfig {...{ nodeData, nodeId }}>
        <NodeCardContent
          glyph={glyph}
          kind={kind ?? getNodeKind(nodeData.type)}
          title={nodeData.label}
          runState={state}
        />
        {children}
      </OpenNodeConfig>
      {lockedByOther && <LockedNodeOverlay nodeId={nodeId} className="rounded-md" />}
    </NodeCard>
  );
};
