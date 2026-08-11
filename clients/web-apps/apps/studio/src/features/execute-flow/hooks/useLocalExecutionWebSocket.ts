import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef } from "react";

import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { useLiveExecutionStore } from "../stores/live-execution-store";

type NodeProgressStatus = "running" | "success" | "failed";

interface NodeProgressMessage {
  type: "nodeProgress";
  jobId: string;
  nodeId: string;
  nodeName: string;
  status: NodeProgressStatus;
}

interface ControlMessage {
  type: "control";
  jobId: string;
  command: "abort" | "pause" | "resume";
}

export type LocalControlCommand = "abort" | "pause" | "resume";

/**
 * Opens a raw WebSocket to the Tauri app's local WebSocket server
 * (ws://127.0.0.1:{port}) while a local (desktop-only) flow is executing.
 *
 * Outbound: the RunnerApp pushes `nodeProgress` messages, which we dispatch into the
 * live-execution store so the canvas can render running/spinner → success/fail per node.
 * Inbound: we can send `control` messages (abort/pause/resume) to the RunnerApp.
 *
 * The Tauri WebSocket server is a broadcast echo bus (every peer sees every message),
 * so all incoming messages are filtered strictly by the current job id.
 */
export const useLocalExecutionWebSocket = () => {
  const socketRef = useRef<WebSocket | null>(null);

  const jobId = useCurrentFlowStore((state) => state.currentFlow.jobId);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let closed = false;

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
        let message: NodeProgressMessage;
        try {
          message = JSON.parse(event.data as string) as NodeProgressMessage;
        } catch {
          return;
        }

        if (message.type !== "nodeProgress") return;
        if (message.jobId !== jobId) return; // broadcast echo — filter by own job

        useLiveExecutionStore.getState().setNodeStatus(message.nodeId, message.status);
      };

      socket.onclose = () => {
        if (!closed) {
          // Local run finished; clear the live map so stale spinners don't linger.
          useLiveExecutionStore.getState().resetLiveExecution();
        }
      };
    };

    // Only subscribe while a local job is active. The hook effect re-runs when jobId
    // changes (including when it becomes empty after a run ends), so we only open a
    // connection while there is an in-flight local job.
    if (!jobId) {
      useLiveExecutionStore.getState().resetLiveExecution();
      return;
    }

    void connect();

    return () => {
      closed = true;
      socket?.close();
      socketRef.current = null;
      useLiveExecutionStore.getState().resetLiveExecution();
    };
  }, [jobId]);

  /** Sends a control message (abort/pause/resume) to the local RunnerApp. */
  const sendControl = (command: LocalControlCommand) => {
    if (!jobId || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    const message: ControlMessage = { type: "control", jobId, command };
    socketRef.current.send(JSON.stringify(message));
  };

  return { sendControl };
};
