import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { Tooltip } from "@avplatform/ui/tooltip";
import { Node, NodeProps, NodeToolbar, Position, useReactFlow } from "@xyflow/react";
import {
  CheckCircle2Icon,
  CircleXIcon,
  ExpandIcon,
  ExternalLinkIcon,
  Loader2,
  ShrinkIcon,
} from "lucide-react";
import { memo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { useLiveExecutionStore } from "@/features/execute-flow/stores/live-execution-store";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useGroupToggle } from "@/features/react-flow/hooks/useGroupToggle";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";
import { useNodeHover } from "@/hooks/useNodeHover";
import { useBreadcrumbStore } from "@/stores/breadcrumb-store";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useReactFlowViewStore } from "@/stores/react-flow-view-store";
import { NodeDataType } from "@/types/node-data-type";

import OpenNodeLog from "../node-container/OpenNodeLog";
import { NodeHeading } from "../node-container/node-header/NodeHeading";
import { NodeImage } from "../node-container/node-header/NodeImage";
import { OpenNodeConfig } from "../node-container/node-header/OpenNodeConfig";

type BlockNodeType = Node<NodeDataType, "blockNode">;

export const BlockNode = memo(
  ({ data, selected, sourcePosition, targetPosition, id }: NodeProps<BlockNodeType>) => {
    const { updateNodeData } = useReactFlow();
    const [searchParams, setSearchParams] = useSearchParams();

    const { pushBreadcrumb } = useBreadcrumbStore();
    const currentFlow = useCurrentFlowStore((state) => state.currentFlow);
    const name = useReactFlowViewStore(useShallow((state) => state.name));

    const { isSavePending } = useReactFlowExtStore(
      useShallow((state) => ({
        isSavePending: state.isSavePending,
      })),
    );

    const { toggleGroupExpand } = useGroupToggle();
    const { isHovered, onMouseEnter, onMouseLeave } = useNodeHover();

    const isExecutionLog = useIsExecutionLogsRoute();
    const isAgentHistory = useIsVersionHistoryRoute();

    const liveStatus = useLiveExecutionStore((state) =>
      data?.isDisabled ? undefined : state.liveExecutionMap[id],
    );

    const handleOpenSubFlow = () => {
      if (isSavePending) {
        toast.warning("Please save changes before opening a subflow");
        return;
      }

      const block = data.selectedBlock;
      if (!block || !block.flowId || !block.id) return;

      const currentFlowId = searchParams.get("f") || currentFlow.id;
      const currentVersionId = searchParams.get("v") || currentFlow.versionId;
      const currentJobId = searchParams.get("j");
      const currentFlowName = isExecutionLog ? name : currentFlow.name;

      if (currentFlowId) {
        pushBreadcrumb({
          flowId: currentFlowId,
          versionId: currentVersionId,
          name: currentFlowName || "Main Flow",
          jobId: currentJobId || undefined,
        });
      }

      const nextParams: Record<string, string> = {
        f: block.flowId,
        v: block.id,
      };

      if (isExecutionLog && currentJobId) {
        nextParams.j = currentJobId;
      }

      setSearchParams(nextParams);
    };

    useEffect(() => {
      if (data.type !== "blockNode") return;

      const isNewNode = data.label === "Call Block";

      if (data.selectedBlock || isNewNode) {
        updateNodeData(id, {
          label: data.selectedBlock?.name ?? "Call Block",
        });
      }
    }, [data.type, data.label, data.selectedBlock, id, updateNodeData]);

    const statusBorderClass =
      liveStatus === "running"
        ? "border-blue-500"
        : liveStatus === "success"
          ? "border-green-500"
          : liveStatus === "failed"
            ? "border-red-500"
            : "border-[#1E1B4B]";

    return (
      <OpenNodeLog nodeId={id} isDisabled={data?.isDisabled} showIcon={false} showBorder={false}>
        <div
          className={cn(
            "custom-drag-handle relative flex h-16 w-16 rounded-full border-2 bg-[#1E1B4B] hover:ring hover:ring-ring",
            statusBorderClass,
            selected && "ring ring-ring",
            data?.isDisabled && "opacity-50",
            data?.isCut && "border-red-400 opacity-60",
            isExecutionLog && "border-0 ring-0",
          )}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <OpenNodeConfig {...{ nodeData: data, nodeId: id }}>
            <div className="flex h-full w-full items-center justify-center">
              <NodeImage src="/assets/BlockNodeIconLight.svg" />

              {/* <BoxesIcon className="h-6 w-6 text-white" /> */}
              <NodeHeading className="text-2xs">{data.label}</NodeHeading>
              <InputHandle position={targetPosition} />
              <OutputHandle position={sourcePosition} />
            </div>
          </OpenNodeConfig>

          {liveStatus === "running" && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[#1E1B4B]/80">
              <Loader2 className="size-4 animate-spin text-white" />
            </div>
          )}
          {liveStatus === "success" && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[#1E1B4B]/80">
              <CheckCircle2Icon className="size-4 text-green-500" />
            </div>
          )}
          {liveStatus === "failed" && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[#1E1B4B]/80">
              <CircleXIcon className="size-4 text-red-500" />
            </div>
          )}

          <NodeToolbar offset={5} isVisible={isHovered} position={Position.Top}>
            {data?.selectedBlock && (
              <button
                onClick={handleOpenSubFlow}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-primary transition-colors flex items-center gap-1 text-xs font-medium"
                title="Open Block"
              >
                <ExternalLinkIcon size={14} />
                <span>Open</span>
              </button>
            )}
            {!isExecutionLog && !isAgentHistory && data?.isGroupHead && (
              <Tooltip content={data?.isExpanded ? "Collapse" : "Expand"}>
                <Button
                  variant="outline"
                  size="icon6"
                  className={cn(
                    "group z-10 mt-1 rounded-full",
                    "hover:bg-primary",
                    "aria-[expanded=true]:bg-primary aria-[expanded=true]:opacity-100",
                    "nodrag nopan",
                  )}
                  onClick={() => toggleGroupExpand(data.groupId || "")}
                >
                  {data?.isExpanded ? (
                    <ShrinkIcon
                      className={cn(
                        "h-3.5 w-3.5 stroke-[1.5] text-[--icon-color] opacity-50",
                        "group-hover:text-white group-hover:opacity-100",
                        "group-aria-[expanded=true]:text-white group-aria-[expanded=true]:opacity-100",
                      )}
                    />
                  ) : (
                    <ExpandIcon
                      className={cn(
                        "h-3.5 w-3.5 stroke-[2.5] text-[--icon-color] opacity-50",
                        "group-hover:text-white group-hover:opacity-100",
                        "group-aria-[expanded=true]:text-white group-aria-[expanded=true]:opacity-100",
                      )}
                    />
                  )}
                </Button>
              </Tooltip>
            )}
          </NodeToolbar>
        </div>
      </OpenNodeLog>
    );
  },
);

BlockNode.displayName = "BlockNode";
