import { Button } from "@avplatform/ui/buttons";
import { ViewContainer } from "@avplatform/ui/components/view-record";
import { JsonViewer, createCopyJsonAction } from "@avplatform/ui/json-viewer";
import { ScrollArea } from "@avplatform/ui/scroll";
import { ArrowsInIcon, ArrowsOutIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { Panel, PanelClose, PanelContent } from "@/components/panel/components/Panel";
import { usePanelStore } from "@/components/panel/stores/panel-store";
import { getLocalExecutionLog } from "@/features/execute-flow/apis/get-version-execution-log";
import { CANVAS_NODE_DETAIL_PANEL_ID } from "@/features/execute-flow/components/ClearRunResultsPanel";
import { JobStatusEnum } from "@/features/execute-flow/enums/job-status-enum";
import { useRunResultsQueryParams } from "@/features/execute-flow/hooks/useRunResultsQueryParams";
import { useJobDataStore } from "@/features/execute-flow/stores/job-data-store";
import { useLiveExecutionStore } from "@/features/execute-flow/stores/live-execution-store";
import { NodeExecutionLogType } from "@/features/execute-flow/types/execution-log-types";
import { buildLiveLoopIndex, getLiveNodeLog } from "@/features/execute-flow/utils/live-loop-index";
import { NodeLogHeader } from "@/features/execution-logs";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useTrackSelectionStore } from "@/stores/track-selection-store";
import { NodeDataType } from "@/types/node-data-type";
import { buildNodeLogPayload } from "@/utils/node-log-payload";

type NodeTiming = {
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
};

export const CanvasNodeDetailPanel = () => {
  const { showRunResults } = useRunResultsQueryParams();
  const [searchParams] = useSearchParams();
  const subflowCallerId = searchParams.get("ci") || "";
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

  const { liveExecutionMap, nodeLogsMap, nodeLogHistory, liveActiveIteration, liveLoopIndex } =
    useLiveExecutionStore(
      useShallow((state) => ({
        liveExecutionMap: state.liveExecutionMap,
        nodeLogsMap: state.nodeLogsMap,
        nodeLogHistory: state.nodeLogHistory,
        liveActiveIteration: state.liveActiveIteration,
        liveLoopIndex: state.liveLoopIndex,
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

  const [nodeTimingMap, setNodeTimingMap] = useState<Record<string, NodeTiming>>({});
  const [expanded, setExpanded] = useState(false);

  // Restore colors, job status and per-node logs from IndexedDB when the page refreshes
  // with the run-results flag, so the panel still works after a reload. Sub-flow node logs
  // are stored under the ROOT run version (`runVersionId`), so that is what we look up here
  // rather than the sub-flow's own `versionId`.
  useEffect(() => {
    if (!showRunResults) return;
    const logVersionId = currentFlow?.runVersionId || currentFlow?.versionId;
    if (!logVersionId) return;

    const restore = async () => {
      const executions = await getLocalExecutionLog(logVersionId);
      if (!executions || executions.length === 0) return;

      const latestExecution = executions[executions.length - 1];
      const map: Record<string, "success" | "failed"> = {};
      const logMap: Record<string, NodeExecutionLogType> = {};
      const restoredHistory: NodeExecutionLogType[] = [];
      const timingMap: Record<string, NodeTiming> = {};
      const baseExecutedOn = new Date(latestExecution.executedOn);

      latestExecution.nodes.forEach((node) => {
        map[node.nodeId] = node.isSuccess ? "success" : "failed";
        const restoredLog: NodeExecutionLogType = {
          nodeExecutionId: node.nodeExecutionId,
          retryAttempt: node.retryAttempt,
          nodeId: node.nodeId,
          nodeName: node.nodeName,
          nodeUniqueName: node.nodeUniqueName,
          isSuccess: node.isSuccess,
          duration: node.duration,
          callerReferenceId: node.callerReferenceId,
          loopReferenceId: node.loopReferenceId,
          loopIterationIndex: node.loopIterationIndex,
          inputs: Object.entries(node.inputs).map(([key, value]) => ({ key, value })),
          outputs: Object.entries(node.outputs).map(([key, value]) => ({ key, value })),
        };
        logMap[node.nodeId] = restoredLog;
        restoredHistory.push(restoredLog);

        const startedAt = baseExecutedOn;
        const endedAt = new Date(startedAt.getTime() + Math.max(0, node.duration) * 1000);
        timingMap[node.nodeId] = { startedAt, endedAt, duration: node.duration };
      });

      useLiveExecutionStore.setState({
        liveExecutionMap: map,
        nodeLogsMap: logMap,
        nodeLogHistory: restoredHistory,
        liveLoopIndex: buildLiveLoopIndex(restoredHistory, useLiveExecutionStore.getState().nodes),
      });
      setNodeTimingMap(timingMap);
      setJob({
        status: latestExecution.isSuccess ? JobStatusEnum.Completed : JobStatusEnum.Failed,
        startTime: baseExecutedOn,
        endTime: new Date(),
      });
    };

    void restore();
  }, [showRunResults, currentFlow?.runVersionId, currentFlow?.versionId, setJob]);

  // Track per-node start/end timing as live RunnerApp status updates arrive.
  useEffect(() => {
    const now = new Date();
    setNodeTimingMap((prev) => {
      const next = { ...prev };
      let changed = false;

      Object.entries(liveExecutionMap).forEach(([nodeId, status]) => {
        const existing = next[nodeId] ?? {};
        if (status === "running" && !existing.startedAt) {
          next[nodeId] = { ...existing, startedAt: now };
          changed = true;
        } else if ((status === "success" || status === "failed") && !existing.endedAt) {
          const log = nodeLogsMap[nodeId];
          const duration =
            log?.duration ??
            Math.max(0, (now.getTime() - (existing.startedAt?.getTime() ?? now.getTime())) / 1000);
          next[nodeId] = { ...existing, endedAt: now, duration };
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [liveExecutionMap, nodeLogsMap]);

  const selectedNode = useMemo(() => {
    if (multipleNodesSelected || selectedNodes.length !== 1) return null;
    return selectedNodes[0];
  }, [multipleNodesSelected, selectedNodes]);

  const nodeData = useMemo(() => {
    return (selectedNode?.data as NodeDataType) || null;
  }, [selectedNode]);

  const nodeLog = useMemo(() => {
    if (!selectedNode) return null;
    const scopedLogs = nodeLogHistory.filter((log) =>
      subflowCallerId ? log.callerReferenceId === subflowCallerId : !log.callerReferenceId,
    );
    return [...scopedLogs].reverse().find((log) => log.nodeId === selectedNode.id) ?? null;
  }, [nodeLogHistory, selectedNode, subflowCallerId]);

  const liveExecutionData = liveLoopIndex;

  const selectedLiveLog = useMemo(() => {
    if (!selectedNode) return nodeLog;
    return (
      getLiveNodeLog(liveExecutionData, subflowCallerId, selectedNode.id, liveActiveIteration) ??
      null
    );
  }, [liveActiveIteration, liveExecutionData, nodeLog, selectedNode, subflowCallerId]);

  const nodeTiming = useMemo(() => {
    if (!selectedNode) return null;
    return nodeTimingMap[selectedNode.id] ?? {};
  }, [selectedNode, nodeTimingMap]);

  const nodeLogPayload = useMemo<Record<string, unknown> | undefined>(() => {
    if (!nodeData || !selectedNode) return undefined;
    return buildNodeLogPayload(selectedLiveLog, {
      displayName: nodeData.label || nodeData.name,
      nodeType: nodeData.type,
      executedAt: nodeTiming?.endedAt,
    });
  }, [nodeData, nodeTiming, selectedLiveLog, selectedNode]);

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

  if (!nodeData || !selectedNode || !selectedLiveLog) {
    return null;
  }

  return (
    <Panel
      id={CANVAS_NODE_DETAIL_PANEL_ID}
      side="right"
      width={expanded ? "w-[46rem] max-w-[calc(100vw-2.5rem)]" : "w-[30rem]"}
      closeOnEscape
    >
      <PanelContent className="overflow-hidden py-2 pl-2">
        <ScrollArea className="h-full w-full">
          <ViewContainer className="pt-1">
            {/* Full node log JSON — same header as the run-history NodeDetailPanel. Only
                render once the node has actually completed and produced a log; a running
                node has no log yet and would otherwise show a card full of fallback
                placeholders. */}
            {selectedLiveLog && nodeLogPayload && (
              <div>
                <div className="flex min-h-12 items-center gap-2 py-1 pr-2">
                  <NodeLogHeader
                    className="min-w-0 flex-1"
                    customName={nodeData.label || nodeData.name}
                    builtInName={nodeData.name}
                    category={nodeData.category}
                    iconUrl={nodeData.iconUrl}
                    icon={nodeData.icon}
                    img={nodeData.img}
                  />
                  <div className="flex shrink-0 items-center gap-1 pr-1">
                    <Button
                      variant="ghost"
                      size="icon8"
                      onClick={() => setExpanded((value) => !value)}
                      aria-label={expanded ? "Narrow panel" : "Widen panel"}
                      title={expanded ? "Narrow panel" : "Widen panel"}
                      className="size-6 p-0 text-muted-foreground/60 opacity-60 hover:text-primary hover:opacity-100"
                    >
                      {expanded ? (
                        <ArrowsInIcon className="size-4" />
                      ) : (
                        <ArrowsOutIcon className="size-4" />
                      )}
                    </Button>
                    {createCopyJsonAction(JSON.stringify(nodeLogPayload, null, 2))}
                    <PanelClose
                      className="h-6 w-6 p-0 -mr-1.5 text-muted-foreground/60 opacity-60 hover:text-primary hover:opacity-100"
                      aria-label="Close panel"
                    >
                      <XIcon className="size-[1.2rem]" />
                    </PanelClose>
                  </div>
                </div>
                <div className="pr-2 pt-2">
                  <JsonViewer
                    jsonData={JSON.stringify(nodeLogPayload, null, 2)}
                    enableValueClipboard
                    viewportClassName=""
                    parseNestedStrings
                    shortenTextAfterLength={70}
                  />
                </div>
              </div>
            )}
          </ViewContainer>
        </ScrollArea>
      </PanelContent>
    </Panel>
  );
};
