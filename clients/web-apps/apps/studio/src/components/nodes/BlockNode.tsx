import { Button } from "@avplatform/ui/buttons";
import { toast } from "@avplatform/ui/sonner";
import { Node, NodeProps, NodeToolbar, Position, useReactFlow } from "@xyflow/react";
import { BoxesIcon, ExternalLinkIcon } from "lucide-react";
import { memo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { useLiveExecutionStore } from "@/features/execute-flow/stores/live-execution-store";
import { buildSubFlowNavigationParams } from "@/features/execute-flow/utils/sub-flow-navigation";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useNodeHover } from "@/hooks/useNodeHover";
import { useBreadcrumbStore } from "@/stores/breadcrumb-store";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useReactFlowViewStore } from "@/stores/react-flow-view-store";
import { NodeDataType } from "@/types/node-data-type";

import { useNodeRunState } from "../node-container/useNodeRunState";
import BaseNode from "./BaseNode";
import { SubflowProgressPopup } from "./subflow-progress-popup/SubflowProgressPopup";

type BlockNodeType = Node<NodeDataType, "blockNode">;

export const BlockNode = memo(
  ({ data, selected, sourcePosition, targetPosition, id }: NodeProps<BlockNodeType>) => {
    const { updateNodeData } = useReactFlow();
    const [searchParams, setSearchParams] = useSearchParams();

    const { pushBreadcrumb } = useBreadcrumbStore(
      useShallow((state) => ({ pushBreadcrumb: state.pushBreadcrumb })),
    );
    const { currentFlow } = useCurrentFlowStore(
      useShallow((state) => ({ currentFlow: state.currentFlow })),
    );
    const name = useReactFlowViewStore(useShallow((state) => state.name));

    const { isSavePending } = useReactFlowExtStore(
      useShallow((state) => ({
        isSavePending: state.isSavePending,
      })),
    );

    const { isHovered, onMouseEnter, onMouseLeave } = useNodeHover();

    const isExecutionLog = useIsExecutionLogsRoute();
    const runState = useNodeRunState(id, data?.isDisabled);

    // When this block is currently running a sub-flow the user hasn't navigated into, show
    // the metadata of the sub-flow-internal node being processed ("Processing: <name>").
    const subflowProgressNode = useLiveExecutionStore((state) =>
      state.subflowProgressNodes.length > 0
        ? state.subflowProgressNodes[state.subflowProgressNodes.length - 1]
        : null,
    );

    const handleOpenSubFlow = () => {
      if (isSavePending) {
        toast.warning("Save your changes before opening the block");
        return;
      }

      const block = data.selectedBlock;
      if (!block || !block.flowId || !block.id) return;

      const currentFlowId = searchParams.get("f") || currentFlow.id;
      const currentVersionId = searchParams.get("v") || currentFlow.versionId;
      const currentJobId = searchParams.get("j");
      // On the execution-log page `currentFlow` is empty, so fall back to the `v` param —
      // that IS the root run version there. Without this, `rv` would be dropped and the
      // sub-flow view would refetch the log list against the sub-flow's own version.
      const currentRunVersionId =
        searchParams.get("rv") ||
        currentFlow.runVersionId ||
        (isExecutionLog ? searchParams.get("v") : undefined);
      // `f`/`v` always describe the current (sub-)flow, so the root flow id must be carried
      // separately — otherwise it is lost as soon as the user enters a sub-flow.
      const currentRunFlowId =
        searchParams.get("rf") ||
        currentFlow.runFlowId ||
        (isExecutionLog ? searchParams.get("f") : undefined);
      const showRunResults = searchParams.get("showRunResults") === "1";
      const currentFlowName = isExecutionLog ? name : currentFlow.name;

      if (currentFlowId) {
        pushBreadcrumb({
          flowId: currentFlowId,
          versionId: currentVersionId,
          name: currentFlowName || "Main Flow",
          jobId: currentJobId || undefined,
          runVersionId: currentRunVersionId || undefined,
          runFlowId: currentRunFlowId || undefined,
        });
      }

      setSearchParams(
        buildSubFlowNavigationParams({
          targetFlowId: block.flowId,
          targetVersionId: block.id,
          showRunResults,
          jobId: currentJobId || undefined,
          runVersionId: currentRunVersionId || undefined,
          runFlowId: currentRunFlowId || undefined,
          // This node IS the caller of the sub-flow being entered.
          callerId: id,
        }),
      );
    };

    useEffect(() => {
      if (data.type !== "blockNode") return;

      const isNewNode = ["Call block", "Call Block"].includes(data.label);

      if (data.selectedBlock || isNewNode) {
        updateNodeData(id, {
          label: data.selectedBlock?.name ?? "Call block",
        });
      }
    }, [data.type, data.label, data.selectedBlock, id, updateNodeData]);

    return (
      <>
        <BaseNode
          selected={selected}
          nodeData={data}
          nodeId={id}
          shape="circle"
          glyph={<BoxesIcon />}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <InputHandle position={targetPosition} />
          <OutputHandle position={sourcePosition} />
        </BaseNode>

        {subflowProgressNode && runState === "running" && (
          <SubflowProgressPopup node={subflowProgressNode} />
        )}

        {data?.selectedBlock && (
          <NodeToolbar
            offset={16}
            isVisible={isHovered}
            position={Position.Top}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <Button
              variant="outline"
              size="xs"
              className="nodrag nopan"
              onClick={handleOpenSubFlow}
            >
              <ExternalLinkIcon className="size-3.5" />
              Open block
            </Button>
          </NodeToolbar>
        )}
      </>
    );
  },
);

BlockNode.displayName = "BlockNode";
