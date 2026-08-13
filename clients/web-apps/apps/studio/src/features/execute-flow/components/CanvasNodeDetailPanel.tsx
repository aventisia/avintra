import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  Panel,
  PanelClose,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "@/components/panel/components/Panel";
import { usePanelStore } from "@/components/panel/stores/panel-store";
import { getLocalExecutionLog } from "@/features/execute-flow/apis/get-version-execution-log";
import { CANVAS_NODE_DETAIL_PANEL_ID } from "@/features/execute-flow/components/ClearRunResultsPanel";
import { JobStatusEnum } from "@/features/execute-flow/enums/job-status-enum";
import { useRunResultsQueryParams } from "@/features/execute-flow/hooks/useRunResultsQueryParams";
import { useJobDataStore } from "@/features/execute-flow/stores/job-data-store";
import { useLiveExecutionStore } from "@/features/execute-flow/stores/live-execution-store";
import FELInputOutput from "@/features/execution-logs/components/FELInputOutput/FELInputOutput";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useTrackSelectionStore } from "@/stores/track-selection-store";
import { NodeDataType } from "@/types/node-data-type";

const formatJson = (data: Record<string, unknown> | undefined) => {
  if (!data) return "{}";
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return "{}";
  }
};

export const CanvasNodeDetailPanel = () => {
  const { showRunResults } = useRunResultsQueryParams();
  const { panels, closePanel } = usePanelStore(
    useShallow((state) => ({
      panels: state.panels,
      closePanel: state.closePanel,
    })),
  );
  const { selectedNodes, multipleNodesSelected } = useTrackSelectionStore(
    useShallow((state) => ({
      selectedNodes: state.selectedNodes,
      multipleNodesSelected: state.multipleNodesSelected,
    })),
  );
  const { nodes } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
    })),
  );
  const { liveExecutionMap } = useLiveExecutionStore(
    useShallow((state) => ({
      liveExecutionMap: state.liveExecutionMap,
    })),
  );
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );
  const { setJob } = useJobDataStore(
    useShallow((state) => ({
      setJob: state.setJob,
    })),
  );

  const [latestExecutionNodes, setLatestExecutionNodes] = useState<
    Record<string, { inputs: Record<string, string>; outputs: Record<string, string> }>
  >({});

  // Restore colors and job status from IndexedDB when the page refreshes with the flag.
  useEffect(() => {
    if (!showRunResults || !currentFlow?.versionId) return;

    const restore = async () => {
      const executions = await getLocalExecutionLog(currentFlow.versionId);
      if (!executions || executions.length === 0) return;

      const latestExecution = executions[executions.length - 1];
      const map: Record<string, "success" | "failed"> = {};
      const nodeMap: Record<
        string,
        { inputs: Record<string, string>; outputs: Record<string, string> }
      > = {};

      latestExecution.nodes.forEach((node) => {
        map[node.nodeId] = node.isSuccess ? "success" : "failed";
        nodeMap[node.nodeId] = { inputs: node.inputs, outputs: node.outputs };
      });

      useLiveExecutionStore.setState({ liveExecutionMap: map });
      setLatestExecutionNodes(nodeMap);
      setJob({
        status: latestExecution.isSuccess ? JobStatusEnum.Completed : JobStatusEnum.Failed,
        startTime: new Date(latestExecution.executedOn),
        endTime: new Date(),
      });
    };

    void restore();
  }, [showRunResults, currentFlow?.versionId, setJob, setLatestExecutionNodes]);

  const selectedNode = useMemo(() => {
    if (multipleNodesSelected || selectedNodes.length !== 1) return null;
    return selectedNodes[0];
  }, [multipleNodesSelected, selectedNodes]);

  const nodeData = useMemo(() => {
    return (selectedNode?.data as NodeDataType) || null;
  }, [selectedNode]);

  const nodeExecution = useMemo(() => {
    if (!selectedNode || !nodeData) return null;
    const nodeId = selectedNode.id;
    if (!liveExecutionMap[nodeId]) return null;

    const nodeFromStore = nodes.find((n) => n.id === nodeId)?.data as NodeDataType | undefined;
    const nodeLog = latestExecutionNodes[nodeId];

    const inputs = nodeLog
      ? nodeLog.inputs
      : nodeFromStore?.inputs
        ? Object.fromEntries(nodeFromStore.inputs.map((i) => [i.key, i.value]))
        : undefined;
    const outputs = nodeLog
      ? nodeLog.outputs
      : nodeFromStore?.outputs
        ? Object.fromEntries(
            nodeFromStore.outputs.map((o) => [o.key, o.value.enabled ? o.value.value : undefined]),
          )
        : undefined;

    return { nodeId, inputs, outputs };
  }, [selectedNode, nodeData, liveExecutionMap, nodes, latestExecutionNodes]);

  // Auto-open the panel when a single colored node is selected.
  useEffect(() => {
    if (!showRunResults || !selectedNode || !liveExecutionMap[selectedNode.id]) {
      return;
    }
    usePanelStore.getState().openPanel(CANVAS_NODE_DETAIL_PANEL_ID, "right");
  }, [showRunResults, selectedNode, liveExecutionMap]);

  // Close the panel when there are no run results or when nothing relevant is selected.
  useEffect(() => {
    const panelOpen = panels[CANVAS_NODE_DETAIL_PANEL_ID]?.isOpen;
    if (!panelOpen) return;

    const noResults = Object.keys(liveExecutionMap).length === 0;
    const nothingToShow = !selectedNode || !liveExecutionMap[selectedNode.id];

    if (noResults || nothingToShow) {
      closePanel(CANVAS_NODE_DETAIL_PANEL_ID);
    }
  }, [closePanel, liveExecutionMap, panels, selectedNode]);

  if (!nodeExecution || !nodeData) {
    return null;
  }

  return (
    <Panel id={CANVAS_NODE_DETAIL_PANEL_ID} side="right" width="w-[28rem]" closeOnEscape>
      <PanelHeader className="pl-4 pr-2">
        <PanelTitle>{nodeData.name || nodeData.label || "Node details"}</PanelTitle>
        <PanelClose />
      </PanelHeader>
      <PanelContent className="space-y-4 p-4">
        <FELInputOutput jsonData={formatJson(nodeExecution.inputs)} title="Input" />
        <FELInputOutput jsonData={formatJson(nodeExecution.outputs)} title="Output" />
      </PanelContent>
    </Panel>
  );
};
