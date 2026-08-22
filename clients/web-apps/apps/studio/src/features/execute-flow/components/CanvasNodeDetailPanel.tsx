import { ViewContainer, ViewInfoRowsCard } from "@avplatform/ui/components/view-record";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { JsonViewer, createCopyJsonAction } from "@avplatform/ui/json-viewer";
import { ScrollArea } from "@avplatform/ui/scroll";
import { formatDate } from "@avplatform/ui/utils";
import { LogsIcon, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useTrackSelectionStore } from "@/stores/track-selection-store";
import { NodeDataType } from "@/types/node-data-type";

type NodeTiming = {
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
};

/** Convert key/value pairs from the stored node log into a plain JSON object. */
const kvArrayToObject = (
  entries?: { key: string; value: unknown }[],
): Record<string, unknown> | undefined => {
  if (!entries || entries.length === 0) return undefined;
  return Object.fromEntries(entries.map((entry) => [entry.key, entry.value]));
};

/** Build the full LAST NODE LOG style payload from a node log plus timing data. */
const buildNodeLogPayload = (
  nodeLog: NodeExecutionLogType | null,
  nodeData: NodeDataType,
  timing: NodeTiming,
): Record<string, unknown> => {
  const inputs = kvArrayToObject(nodeLog?.inputs);
  const outputs = kvArrayToObject(nodeLog?.outputs);

  return {
    nodeExecutionId: nodeLog?.nodeExecutionId ?? FALLBACK_VALUE,
    retryAttempt: nodeLog?.retryAttempt ?? 0,
    nodeId: nodeLog?.nodeId ?? FALLBACK_VALUE,
    nodeDisplayName: nodeData.label || nodeData.name || nodeLog?.nodeName || FALLBACK_VALUE,
    nodeUniqueName: nodeLog?.nodeUniqueName ?? nodeData.type ?? FALLBACK_VALUE,
    isSuccess: nodeLog?.isSuccess ?? false,
    duration: nodeLog?.duration ?? timing.duration ?? 0,
    executedAt: timing.endedAt ? formatDate(timing.endedAt, true) : FALLBACK_VALUE,
    inputs: inputs ?? {},
    outputs: outputs ?? {},
  };
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

  const { liveExecutionMap, nodeLogsMap } = useLiveExecutionStore(
    useShallow((state) => ({
      liveExecutionMap: state.liveExecutionMap,
      nodeLogsMap: state.nodeLogsMap,
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
      const timingMap: Record<string, NodeTiming> = {};
      const baseExecutedOn = new Date(latestExecution.executedOn);

      latestExecution.nodes.forEach((node) => {
        map[node.nodeId] = node.isSuccess ? "success" : "failed";
        logMap[node.nodeId] = {
          nodeExecutionId: node.nodeExecutionId,
          retryAttempt: node.retryAttempt,
          nodeId: node.nodeId,
          nodeName: node.nodeName,
          nodeUniqueName: node.nodeUniqueName,
          isSuccess: node.isSuccess,
          duration: node.duration,
          inputs: Object.entries(node.inputs).map(([key, value]) => ({ key, value })),
          outputs: Object.entries(node.outputs).map(([key, value]) => ({ key, value })),
        };

        const startedAt = baseExecutedOn;
        const endedAt = new Date(startedAt.getTime() + Math.max(0, node.duration) * 1000);
        timingMap[node.nodeId] = { startedAt, endedAt, duration: node.duration };
      });

      useLiveExecutionStore.setState({ liveExecutionMap: map, nodeLogsMap: logMap });
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
    return nodeLogsMap[selectedNode.id] ?? null;
  }, [selectedNode, nodeLogsMap]);

  const nodeTiming = useMemo(() => {
    if (!selectedNode) return null;
    return nodeTimingMap[selectedNode.id] ?? {};
  }, [selectedNode, nodeTimingMap]);

  const nodeLogPayload = useMemo<Record<string, unknown> | undefined>(() => {
    if (!nodeData || !selectedNode) return undefined;
    return buildNodeLogPayload(nodeLog, nodeData, nodeTiming ?? {});
  }, [nodeData, nodeLog, nodeTiming, selectedNode]);

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

  if (!nodeData || !selectedNode || !nodeLog) {
    return null;
  }

  return (
    <Panel id={CANVAS_NODE_DETAIL_PANEL_ID} side="right" width="w-[36rem]" closeOnEscape>
      <PanelContent className="overflow-hidden py-2 pl-2">
        <ScrollArea className="h-full w-full">
          <ViewContainer className="pt-1">
            {/* Full node log JSON — same design as LAST NODE LOG. Only render once the
                node has actually completed and produced a log; a running node has no log
                yet and would otherwise show a card full of fallback placeholders. */}
            {nodeLog && nodeLogPayload && (
              <ViewInfoRowsCard
                title="Node Log"
                icon={<LogsIcon className="size-3.5 text-muted-foreground" />}
                action={
                  <div className="flex items-center gap-1 pr-1">
                    {createCopyJsonAction(JSON.stringify(nodeLogPayload, null, 2))}
                    <PanelClose
                      className="h-6 w-6 p-0 -mr-1.5 text-muted-foreground/60 opacity-60 hover:text-primary hover:opacity-100"
                      aria-label="Close panel"
                    >
                      <X className="size-[1.2rem]" />
                    </PanelClose>
                  </div>
                }
                className="border-0 bg-transparent p-0 pt-0 shadow-none"
                headerClassName="px-0"
                bodyClassName="pt-2 px-0 pr-2"
              >
                <JsonViewer
                  jsonData={JSON.stringify(nodeLogPayload, null, 2)}
                  enableValueClipboard
                  viewportClassName=""
                  parseNestedStrings
                  shortenTextAfterLength={70}
                />
              </ViewInfoRowsCard>
            )}
          </ViewContainer>
        </ScrollArea>
      </PanelContent>
    </Panel>
  );
};
