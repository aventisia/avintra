import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { Tooltip } from "@avplatform/ui/tooltip";
// import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Node, NodeProps, NodeToolbar, Position, useReactFlow } from "@xyflow/react";
import { ExpandIcon, ExternalLinkIcon, ShrinkIcon } from "lucide-react";
import { memo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { buildSubFlowNavigationParams } from "@/features/execute-flow/utils/sub-flow-navigation";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useGroupToggle } from "@/features/react-flow/hooks/useGroupToggle";
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

type CallAgentNode = Node<NodeDataType, "callAgentNode">;

export const CallAgentNode = memo(
  ({ data, selected, sourcePosition, targetPosition, id }: NodeProps<CallAgentNode>) => {
    const { toggleGroupExpand } = useGroupToggle();
    const { isHovered, onMouseEnter, onMouseLeave } = useNodeHover();

    // Get ReactFlowExt store state & actions
    const { isSavePending } = useReactFlowExtStore(
      useShallow((state) => ({
        isSavePending: state.isSavePending,
      })),
    );

    const isExecutionLog = useIsExecutionLogsRoute();

    const { updateNodeData } = useReactFlow();
    useEffect(() => {
      if (data.type !== "callAgentNode") return;
      const isNewMod = ["Call Agent"].includes(data.label);

      if (data?.selectedAgent || isNewMod) {
        const newLabel = data?.selectedAgent ? data?.selectedAgent?.name : "Call Agent";
        if (newLabel) {
          //  node by id and update its label
          updateNodeData(id, {
            label: newLabel,
          });
        }
      }
    }, [data.label, data?.selectedAgent]);

    const [searchParams, setSearchParams] = useSearchParams();

    const pushBreadcrumb = useBreadcrumbStore((state) => state.pushBreadcrumb);
    const currentFlow = useCurrentFlowStore((state) => state.currentFlow);
    const name = useReactFlowViewStore(useShallow((state) => state.name));

    const handleOpenSubFlow = () => {
      if (isSavePending) {
        toast.warning("Please save changes");
        return;
      }

      const agentData = data.selectedAgent;
      if (!agentData) return;

      // Extract current URL state as fallback for Execution Log mode
      const currentFlowId = searchParams.get("f") || currentFlow.id;
      const currentVersionId = searchParams.get("v") || currentFlow.versionId;
      const currentJobId = searchParams.get("j");
      const currentRunVersionId = searchParams.get("rv") || currentFlow.runVersionId;
      const showRunResults = searchParams.get("showRunResults") === "1";
      const currentFlowName = isExecutionLog ? name : currentFlow.name;

      if (currentFlowId) {
        pushBreadcrumb({
          flowId: currentFlowId,
          versionId: currentVersionId,
          name: currentFlowName || "Main Flow",
          jobId: currentJobId || undefined,
          runVersionId: currentRunVersionId || undefined,
        });
      }

      setSearchParams(
        buildSubFlowNavigationParams({
          targetFlowId: agentData.flowId,
          targetVersionId: agentData.id || "",
          showRunResults,
          jobId: currentJobId || undefined,
          runVersionId: currentRunVersionId || undefined,
        }),
      );
    };
    return (
      <OpenNodeLog nodeId={id} isDisabled={data?.isDisabled}>
        <div
          className={cn(
            "custom-drag-handle relative flex h-16 w-16 rounded-full border-2 border-[#1E1B4B] bg-[#1E1B4B] hover:ring hover:ring-ring",
            selected && "border-primary ring ring-ring",
            data?.isDisabled && "opacity-50",
            data?.isCut && "border-red-400 opacity-60",
            isExecutionLog && "border-0 ring-0",
          )}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <OpenNodeConfig {...{ nodeData: data, nodeId: id }}>
            <div className="flex h-full w-full items-center justify-center">
              {/* <NodeHeader> */}
              <NodeImage src="/assets/NewAgentIcon.svg" />
              <NodeHeading className="text-2xs">{data.label}</NodeHeading>
              <InputHandle position={targetPosition} />
              <OutputHandle position={sourcePosition} />
            </div>
          </OpenNodeConfig>
          <NodeToolbar offset={5} isVisible={isHovered} position={Position.Top}>
            {data?.selectedAgent && (
              <button
                onClick={handleOpenSubFlow}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-primary transition-colors flex items-center gap-1 text-xs font-medium"
                title="Open Agent"
              >
                <ExternalLinkIcon size={14} />
                <span>Open</span>
              </button>
            )}
            {data?.isGroupHead && (
              <Tooltip content={data?.isExpanded ? "Collapse" : "Expand"}>
                <Button
                  variant={"outline"}
                  size={"icon6"}
                  className={cn(
                    "group z-10 rounded-full ",
                    "hover:bg-primary  mt-1",
                    "aria-[expanded=true]:bg-primary aria-[expanded=true]:opacity-100",
                    "nodrag nopan",
                  )}
                  onClick={() => toggleGroupExpand(data?.groupId || "")}
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

CallAgentNode.displayName = "CallAgentNode";
