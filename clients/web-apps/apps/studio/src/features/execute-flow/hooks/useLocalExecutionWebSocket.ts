import { useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef } from "react";

import { AC_QUERY_KEY } from "@/features/available-credits/available-credits-constants.ee";
import { NodeExecutionLogType } from "@/features/execute-flow/types/execution-log-types";
import { saveCompletedExecutionLog } from "@/features/execute-flow/utils/save-node-execution-log";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { useLiveExecutionStore } from "../stores/live-execution-store";
import { useRunResultsQueryParams } from "./useRunResultsQueryParams";

type NodeProgressStatus = "running" | "success" | "failed";

/** Shape of the per-node log payload sent by the RunnerApp (mirrors C# NodeExecutionLog). */
interface IncomingNodeLog {
  nodeId: string;
  nodeName: string;
  nodeUniqueName: string;
  isSuccess: boolean;
  duration: number;
  uniqueNodeId?: string;
  callerReferenceId?: string;
  loopReferenceId?: string;
  loopIterationIndex?: number;
  inputs?: Record<string, string>;
  outputs?: Record<string, string>;
}

interface NodeProgressMessage {
  type: "nodeProgress";
  jobId: string;
  nodeId: string;
  nodeName: string;
  status: NodeProgressStatus;
  nodeLog?: IncomingNodeLog;
}

/** Sent once by the RunnerApp when the whole local job reaches a terminal state. */
interface JobCompletedMessage {
  type: "jobCompleted";
  jobId: string;
  status: string;
  message?: string;
  nodeLogs?: IncomingNodeLog[];
}

interface EdgeTraversedMessage {
  type: "edgeTraversed";
  jobId: string;
  edgeId: string;
  targetNodeId: string;
}

interface ControlMessage {
  type: "control";
  jobId: string;
  command: "abort";
}

export type LocalControlCommand = "abort";

/** Maps the RunnerApp's C# node-log payload into the frontend NodeExecutionLogType. */
const mapIncomingNodeLog = (log: IncomingNodeLog): NodeExecutionLogType => ({
  nodeExecutionId: log.uniqueNodeId || `${log.nodeId}-${Date.now()}`,
  retryAttempt: 0,
  nodeId: log.nodeId,
  nodeName: log.nodeName,
  nodeUniqueName: log.nodeUniqueName,
  isSuccess: log.isSuccess,
  duration: log.duration / 1000, // ms → seconds (matches NodeExecutionLogType contract)
  callerReferenceId: log.callerReferenceId,
  loopReferenceId: log.loopReferenceId,
  loopIterationIndex: log.loopIterationIndex,
  inputs: Object.entries(log.inputs ?? {}).map(([key, value]) => ({ key, value })),
  outputs: Object.entries(log.outputs ?? {}).map(([key, value]) => ({ key, value })),
});

/**
 * Opens a raw WebSocket to the Tauri app's local WebSocket server
 * (ws://127.0.0.1:{port}) while a local (desktop-only) flow is executing.
 *
 * Outbound: the RunnerApp pushes `nodeProgress` messages, which we dispatch into the
 * live-execution store so the canvas can render running/spinner → success/fail per node.
 * Inbound: we can send `control` messages (abort only) to the RunnerApp.
 *
 * The Tauri WebSocket server is a broadcast echo bus (every peer sees every message),
 * so all incoming messages are filtered strictly by the current job id.
 */
export const useLocalExecutionWebSocket = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  const jobId = useCurrentFlowStore((state) => state.currentFlow.jobId);
  const versionId = useCurrentFlowStore((state) => state.currentFlow.versionId);
  // The root flow version that owns the run's logs. When executing the parent flow with
  // sub-flows, sub-flow node logs are still persisted under the root (parent) version, so
  // we must use this (not the current `versionId`) as the IndexedDB key.
  const runVersionId = useCurrentFlowStore((state) => state.currentFlow.runVersionId);
  const { setShowRunResults } = useRunResultsQueryParams();

  // Current canvas node ids. We keep them in a ref (mirroring the versionId pattern) so the
  // WebSocket effect can stay keyed on `jobId` only. A nodeProgress message whose nodeId is
  // NOT in this set refers to a sub-flow-internal node (the sub-flow graph is not loaded in
  // this canvas), which we surface as "Processing: <name>" on the active sub-flow caller.
  const nodes = useReactFlowExtStore((state) => state.nodes);
  const canvasNodeIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    canvasNodeIdsRef.current = new Set(nodes.map((n) => n.id));
  }, [nodes]);

  // Keep the latest values in refs so the WebSocket connection effect only depends on
  // `jobId`. Calling `setShowRunResults` on job completion changes the callback identity
  // (URL search params change), which would otherwise re-run the effect and trigger its
  // cleanup `resetLiveExecution()`, wiping the colored canvas immediately after a run.
  const versionIdRef = useRef(versionId);
  const setShowRunResultsRef = useRef(setShowRunResults);
  useEffect(() => {
    versionIdRef.current = versionId;
    setShowRunResultsRef.current = setShowRunResults;
  }, [versionId, setShowRunResults]);

  // Tracks whether we are currently in an in-flight local job so we can distinguish a real
  // job-ending reset from a fresh mount (e.g. a refresh with ?showRunResults=1) that must
  // NOT wipe the IndexedDB-restored canvas colors.
  const hasActiveJobRef = useRef(false);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let closed = false;

    // Accumulate per-node outcomes during the run so we can persist them on completion,
    // even if the RunnerApp does not include full nodeLogs in the jobCompleted payload.
    const nodeLogsByExecutionId = new Map<string, NodeExecutionLogType>();

    // Friendly metadata for sub-flow-internal nodes, keyed by nodeId. The runner sends the raw
    // nodeId as the "nodeName" on running messages, so we capture the friendlier name/type from
    // each completed log and reuse them the next time that node runs (e.g. the next iteration
    // of a loop inside the sub-flow).
    const subflowNodeMetaByNodeId = new Map<string, { nodeName: string; nodeType: string }>();

    // Buffer of pending per-node status/log updates, flushed once per animation frame so a
    // burst of progress messages (the tail of a large flow) collapses into a single store
    // update and a single re-render cascade instead of one per node. WebSocket `onmessage`
    // events are separate macrotasks, so React's automatic batching does not coalesce them.
    const pendingUpdates = new Map<
      string,
      { nodeId: string; status: NodeProgressStatus; log?: NodeExecutionLogType }
    >();
    let flushScheduled = false;
    const flushPendingUpdates = () => {
      flushScheduled = false;
      if (pendingUpdates.size === 0) return;
      const updates = Array.from(pendingUpdates.values());
      pendingUpdates.clear();
      useLiveExecutionStore.getState().applyBatch(updates);
    };

    const connect = async () => {
      let port: number | null = null;
      try {
        port = await invoke<number | null>("get_websocket_port");
      } catch {
        // Not running inside Tauri / server not started yet — nothing to subscribe to.
        return;
      }

      if (closed || !port || port <= 0) return;

      socket = new WebSocket(`ws://127.0.0.1:${port}`);
      socketRef.current = socket;

      socket.onmessage = (event) => {
        let message: NodeProgressMessage | JobCompletedMessage | EdgeTraversedMessage;
        try {
          message = JSON.parse(event.data as string) as
            NodeProgressMessage | JobCompletedMessage | EdgeTraversedMessage;
        } catch {
          return;
        }

        // Broadcast echo bus: filter strictly by the current job id.
        if (message.jobId !== jobId) return;

        if (message.type === "nodeProgress") {
          // Sub-flow-internal node detection: a progress node whose id is NOT present in the
          // currently loaded canvas belongs to a sub-flow the user has not navigated into. We
          // track its metadata so the block/call-agent node can show "Processing: <name>"
          // while the sub-flow runs, instead of leaving the user blind inside the sub-flow.
          if (!canvasNodeIdsRef.current.has(message.nodeId)) {
            // Prefer the friendly metadata cached from a completed log; otherwise fall back to
            // the message's own name (the runner sends the raw id as the name on running).
            const cached = subflowNodeMetaByNodeId.get(message.nodeId);
            const node: { nodeId: string; nodeName: string; nodeType: string } = {
              nodeId: message.nodeId,
              nodeName: cached?.nodeName || message.nodeName || message.nodeId,
              nodeType: cached?.nodeType || "",
            };
            if (message.status === "running") {
              useLiveExecutionStore.getState().pushSubflowProgressNode(node);
            } else {
              useLiveExecutionStore.getState().popSubflowProgressNode(message.nodeId);
            }
          }

          // Capture the final outcome + full log (when provided) so we can persist it.
          if (message.status !== "running" && message.nodeLog) {
            const mappedLog = mapIncomingNodeLog(message.nodeLog);
            nodeLogsByExecutionId.set(mappedLog.nodeExecutionId, mappedLog);
            subflowNodeMetaByNodeId.set(message.nodeId, {
              nodeName: message.nodeLog.nodeName || message.nodeId,
              nodeType: message.nodeLog.nodeUniqueName || "",
            });
            // Buffer the status + log and flush once per frame (see `flushPendingUpdates`).
            pendingUpdates.set(message.nodeId, {
              nodeId: message.nodeId,
              status: message.status,
              log: mappedLog,
            });
          } else {
            pendingUpdates.set(message.nodeId, {
              nodeId: message.nodeId,
              status: message.status,
            });
          }

          if (!flushScheduled) {
            flushScheduled = true;
            requestAnimationFrame(flushPendingUpdates);
          }
        } else if (message.type === "edgeTraversed") {
          useLiveExecutionStore.getState().markEdgeTraversed(message.edgeId);
        } else if (message.type === "jobCompleted") {
          // Flush any buffered per-node updates before applying the final log set, so the
          // last nodes' statuses are not lost when `setNodeLogHistory` overwrites the maps.
          flushPendingUpdates();

          // Local (desktop) runs do not get a backend SignalR JobCompleted notification
          // (the runner only calls the REST CloseJob endpoint). The runner pushes this
          // message over the WS once the whole job finishes, so reset the execute button
          // back to the green play state here.
          useCurrentFlowStore.getState().setExecutionState("stopped");
          setShowRunResultsRef.current(true);
          // No sub-flow is running anymore once the job ends — drop any lingering progress.
          useLiveExecutionStore.getState().clearSubflowProgress();

          // Credits are consumed server-side when the job closes; refresh the header
          // balance so it updates without needing a manual page reload.
          queryClient.invalidateQueries({ queryKey: AC_QUERY_KEY });

          // Persist the completed run (per-node logs + job outcome) to IndexedDB so a
          // refresh with ?showRunResults=1 can restore the colored canvas and panel.
          // Logs are keyed by the ROOT run version (`rv`) — the engine records parent and
          // sub-flow node logs under the job's root flow version, so using the current
          // `versionId` would strand sub-flow logs under the sub-flow version.
          const nodeLogs = message.nodeLogs?.length
            ? message.nodeLogs.map(mapIncomingNodeLog)
            : Array.from(nodeLogsByExecutionId.values());
          const persistVersionId = runVersionId || versionIdRef.current;
          if (persistVersionId && nodeLogs.length > 0) {
            void saveCompletedExecutionLog(
              persistVersionId,
              jobId,
              nodeLogs,
              message.status === "Completed",
            );
          }

          // Ensure the live node-log map contains the final logs even if they were
          // bundled only in the jobCompleted payload.
          useLiveExecutionStore.getState().setNodeLogHistory(nodeLogs);
        }
      };

      socket.onclose = () => {
        if (!closed) {
          // Socket closed while a local job was active (e.g. the Tauri server stopped).
          // Clear the live map so stale spinners don't linger.
          useLiveExecutionStore.getState().resetLiveExecution();
        }
      };
    };

    // Only subscribe while a local job is active. The hook effect re-runs only when jobId
    // changes (including when it becomes empty after a run ends). On a fresh mount with no
    // job (e.g. a refresh carrying ?showRunResults=1) we must NOT reset the live map, or we
    // would wipe the IndexedDB-restored colors.
    if (!jobId) {
      if (hasActiveJobRef.current) {
        // We previously had an active job that ended — clear stale spinners.
        hasActiveJobRef.current = false;
        useLiveExecutionStore.getState().resetLiveExecution();
      }
      return;
    }

    hasActiveJobRef.current = true;
    void connect();

    return () => {
      closed = true;
      socket?.close();
      socketRef.current = null;
      useLiveExecutionStore.getState().resetLiveExecution();
    };
  }, [jobId]);

  /** Sends an abort control message to the local RunnerApp. */
  const sendControl = (command: LocalControlCommand) => {
    if (!jobId || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    const message: ControlMessage = { type: "control", jobId, command };
    socketRef.current.send(JSON.stringify(message));
  };

  return { sendControl };
};
