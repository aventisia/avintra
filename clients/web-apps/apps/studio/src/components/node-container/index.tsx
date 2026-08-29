import { cn } from "@avplatform/ui/lib";

import { LockedNodeOverlay } from "@/features/collaboration/components/LockedNodeOverlay";
import { useNodeLockedByOther } from "@/features/collaboration/hooks/useNodeLockedByOther";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { NodeDataType } from "@/types/node-data-type";

import { OpenNodeConfig } from "./node-header/OpenNodeConfig";

interface NodeContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  nodeId: string;
  nodeData: NodeDataType;
  selected?: boolean;
}

export const NodeContainer = ({
  nodeId,
  nodeData,
  selected = false,
  className,
  children,
  ...props
}: NodeContainerProps) => {
  const isExecutionLog = useIsExecutionLogsRoute();

  // Collaboration: a node locked by another user is non-interactive and shows an overlay.
  const { lockedByOther } = useNodeLockedByOther(nodeId);

  return (
    <div
      className={cn(
        "custom-drag-handle flex h-16 w-16 rounded-lg border border-slate-300   bg-white hover:ring hover:ring-ring",
        nodeData.type == "forLoopNode" && "border-[#1E1B4B] bg-[#1E1B4B]",
        nodeData.type == "conditionalNode" && "border-[#1E1B4B] bg-[#1E1B4B]",
        !!nodeData?.groupId && "border-slate-800",
        className,
        selected && "border-primary",
        nodeData?.isDisabled && "opacity-50",
        nodeData?.isCut && "border-red-400 opacity-60",
        isExecutionLog && "border-0",
        lockedByOther && "pointer-events-none opacity-70",
      )}
      {...props}
    >
      <OpenNodeConfig {...{ nodeData, nodeId }}>{children}</OpenNodeConfig>
      {lockedByOther && <LockedNodeOverlay nodeId={nodeId} />}
    </div>
  );
};
