import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef } from "react";

import { NodeExecutionLogType } from "@/features/execute-flow/types/execution-log-types";
import { saveCompletedExecutionLog } from "@/features/execute-flow/utils/save-node-execution-log";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

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

  const jobId = useCurrentFlowStore((state) => state.currentFlow.jobId);
  const versionId = useCurrentFlowStore((state) => state.currentFlow.versionId);
  const { setShowRunResults } = useRunResultsQueryParams();

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
    const nodeLogsByNodeId = new Map<string, NodeExecutionLogType>();

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
          useLiveExecutionStore.getState().setNodeStatus(message.nodeId, message.status);
          // Capture the final outcome + full log (when provided) so we can persist it.
          if (message.status !== "running" && message.nodeLog) {
            const mappedLog = mapIncomingNodeLog(message.nodeLog);
            nodeLogsByNodeId.set(message.nodeId, mappedLog);
            useLiveExecutionStore.getState().setNodeLog(message.nodeId, mappedLog);
          }
        } else if (message.type === "edgeTraversed") {
          useLiveExecutionStore.getState().markEdgeTraversed(message.edgeId);
        } else if (message.type === "jobCompleted") {
          // Local (desktop) runs do not get a backend SignalR JobCompleted notification
          // (the runner only calls the REST CloseJob endpoint). The runner pushes this
          // message over the WS once the whole job finishes, so reset the execute button
          // back to the green play state here.
          useCurrentFlowStore.getState().setExecutionState("stopped");
          setShowRunResultsRef.current(true);

          // Persist the completed run (per-node logs + job outcome) to IndexedDB so a
          // refresh with ?showRunResults=1 can restore the colored canvas and panel.
          const nodeLogs = message.nodeLogs?.length
            ? message.nodeLogs.map(mapIncomingNodeLog)
            : Array.from(nodeLogsByNodeId.values());
          if (versionIdRef.current && nodeLogs.length > 0) {
            void saveCompletedExecutionLog(
              versionIdRef.current,
              jobId,
              nodeLogs,
              message.status === "Completed",
            );
          }

          // Ensure the live node-log map contains the final logs even if they were
          // bundled only in the jobCompleted payload.
          nodeLogs.forEach((log) => {
            useLiveExecutionStore.getState().setNodeLog(log.nodeId, log);
          });
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
