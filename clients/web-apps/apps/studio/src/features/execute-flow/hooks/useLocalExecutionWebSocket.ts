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

/** Sent once by the RunnerApp when the whole local job reaches a terminal state. */
interface JobCompletedMessage {
  type: "jobCompleted";
  jobId: string;
  status: string;
  message?: string;
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
        let message: NodeProgressMessage | JobCompletedMessage;
        try {
          message = JSON.parse(event.data as string) as NodeProgressMessage | JobCompletedMessage;
        } catch {
          return;
        }

        // Broadcast echo bus: filter strictly by the current job id.
        if (message.jobId !== jobId) return;

        if (message.type === "nodeProgress") {
          useLiveExecutionStore.getState().setNodeStatus(message.nodeId, message.status);
        } else if (message.type === "jobCompleted") {
          // Local (desktop) runs do not get a backend SignalR JobCompleted notification
          // (the runner only calls the REST CloseJob endpoint). The runner pushes this
          // message over the WS once the whole job finishes, so reset the execute button
          // back to the green play state here.
          useCurrentFlowStore.getState().setExecutionState("stopped");
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
