import { IS_TAURI } from "@avplatform/ui/constants";
import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { JobStatusEnum } from "@/features/03-orchestrator/jobs-table/enums/job-status-enum";

import {
  WebSocketCommandType,
  WebSocketMessageType,
  getExecutionState,
  sendExecutionComplete,
  sendNextNodeToProcess,
  sendNodeToProcess,
} from "..";
import { closeJob } from "../apis/job-trigger-apis";
import { insertNodeExecutionLogs } from "../apis/node-execution-log.apis";
import { NodeExecutionLogDto } from "../dtos/node-execution-log.dto";
import { useCurrentFlowStore } from "../stores/current-flow-store";
import { useJobDataStore } from "../stores/job-data-store";

const NODE_LOG_BATCH_SIZE = 5;

export default function useWebSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const isConnected = useRef(false); // Track connection state
  const isConnecting = useRef(false);
  const pendingNodeLogs = useRef<NodeExecutionLogDto[]>([]);

  // Get setExecutionState action from current flow store
  const { currentFlow, setExecutionState } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      setExecutionState: state.setExecutionState,
    })),
  );

  const { status, updateField } = useJobDataStore(
    useShallow((state) => ({
      updateField: state.updateField,
      status: state.status,
    })),
  );

  const [currExecCommand, setCurrExecCommand] = useState<"abort" | "complete" | "error" | null>(
    null,
  );

  // Function to send command to web socket
  const sendCommand = useCallback(
    (command: WebSocketCommandType, data?: string) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        // Send the message as a string
        socketRef.current.send(
          JSON.stringify({
            source: "react",
            command,
            data,
          }),
        );

        if (command === "abort" || command === "complete" || command == "error") {
          const endTime = new Date();
          const status =
            command === "complete"
              ? JobStatusEnum.Completed
              : command === "abort"
                ? JobStatusEnum.Aborted
                : JobStatusEnum.Failed;

          updateField("endTime", endTime);
          updateField("status", status);

          setCurrExecCommand(command); // for credits and job data
        }

        // Update the execution state based on the command
        setExecutionState(getExecutionState(command));
      } else {
        console.warn("WebSocket not connected");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setExecutionState],
  );

  // Connect to web socket and handle messages
  useEffect(() => {
    // App is outside of tauri, web socket not available
    if (!IS_TAURI) return;

    let isCancelled = false;

    const connect = async () => {
      // Prevent duplicate connections from re-renders/StrictMode effect replay.
      if (isConnected.current || isConnecting.current) return;

      isConnecting.current = true;

      // Create WebSocket connection
      const wsPort = await invoke("get_websocket_port");

      if (isCancelled) {
        isConnecting.current = false;
        return;
      }

      const socket = new WebSocket(`ws://127.0.0.1:${wsPort}`);
      socketRef.current = socket;

      // Open the connection
      socket.onopen = () => {
        if (isCancelled) {
          socket.close(1000, "Component unmounted");
          return;
        }

        isConnected.current = true;
        isConnecting.current = false;
        console.log("WebSocket connected at port: " + wsPort);
      };

      // On webSocket message received
      socket.onmessage = async (event: MessageEvent) => {
        try {
          // Parse the incoming message
          const msg = JSON.parse(event.data) as WebSocketMessageType;

          //  Check if the message is from the expected source and has a command
          if (msg.source !== "wpf" || !msg.command) return;

          // Update the execution state based on the command
          setExecutionState(getExecutionState(msg.command));

          // Handle different commands
          switch (msg.command) {
            case "pause":
            case "abort":
            case "error":
            case "complete":
              sendExecutionComplete(msg.command, sendCommand, msg.data || "{}");
              break;
            case "start":
              sendNextNodeToProcess(sendCommand);
              break;
            case "save-execution-log":
              {
                const parsedLog = parseNodeExecutionLog(msg.data || "{}");
                if (parsedLog) {
                  pendingNodeLogs.current.push(parsedLog);
                  if (pendingNodeLogs.current.length >= NODE_LOG_BATCH_SIZE) {
                    await flushPendingNodeLogs(currentFlow.jobId, pendingNodeLogs.current);
                  }
                }
              }
              break;
            default:
              await sendNodeToProcess(msg.data || "nodeId", sendCommand);
              break;
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      // Handle errors
      socket.onerror = (error) => {
        isConnecting.current = false;
        console.error("WebSocket error:", error);
      };

      // Handle connection close
      socket.onclose = () => {
        isConnected.current = false;
        isConnecting.current = false;
        if (socketRef.current === socket) {
          socketRef.current = null;
        }
        console.log("WebSocket disconnected");
      };
    };

    connect();

    // Cleanup function to close the socket when the component unmounts
    return () => {
      isCancelled = true;

      if (
        socketRef.current &&
        (socketRef.current.readyState === WebSocket.OPEN ||
          socketRef.current.readyState === WebSocket.CONNECTING)
      ) {
        socketRef.current.close(1000, "Component unmounted");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendCommand]);

  useEffect(() => {
    // Only run if one of the commands is pending
    if (!currExecCommand) return;

    const handleExecutionData = async () => {
      try {
        // Flush any remaining node logs before closing the job.
        await flushPendingNodeLogs(currentFlow.jobId, pendingNodeLogs.current);

        // Close the job in a terminal status. The backend tracks consumed credits.
        await closeJob({
          id: currentFlow.jobId || "jobId-unknown",
          closingStatus: status,
          nodeExecutionLogs: [],
        });
      } catch (error) {
        // Log any errors that occur during the process
        console.error("Error during execution close:", error);
      } finally {
        // Reset both commands after execution is done
        setCurrExecCommand(null);
      }
    };

    // Run the function to handle both tasks
    handleExecutionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currExecCommand]);

  // Heartbeat removed: start/close endpoints now own the job lifecycle timestamps and status.
  // Running-state syncing is no longer needed because the backend records StartTime when
  // startJob is called and EndTime/CreditsConsumed when closeJob is called.

  return { sendCommand };
}

// Parses a raw WebSocket node execution log payload into a typed DTO.
function parseNodeExecutionLog(data: string): NodeExecutionLogDto | null {
  try {
    const parsed = JSON.parse(data);
    return {
      nodeExecutionId: parsed.nodeExecutionId ?? parsed.uniqueNodeId ?? "",
      retryAttempt: parsed.retryAttempt ?? 0,
      nodeId: parsed.nodeId ?? "",
      nodeDisplayName: parsed.nodeName ?? "",
      nodeUniqueName: parsed.nodeUniqueName ?? "",
      isSuccess: parsed.isSuccess ?? false,
      duration: parsed.duration ?? 0,
      inputs: parsed.inputs ?? {},
      outputs: parsed.outputs ?? {},
    };
  } catch {
    console.error("Invalid node execution log payload:", data);
    return null;
  }
}

// Sends a batch of pending node logs to the backend and clears the buffer.
async function flushPendingNodeLogs(
  jobId: string | undefined,
  pendingLogs: NodeExecutionLogDto[],
): Promise<void> {
  if (!jobId || pendingLogs.length === 0) return;

  try {
    await insertNodeExecutionLogs(jobId, [...pendingLogs]);
    pendingLogs.length = 0;
  } catch (error) {
    console.error("Failed to flush pending node execution logs:", error);
  }
}
