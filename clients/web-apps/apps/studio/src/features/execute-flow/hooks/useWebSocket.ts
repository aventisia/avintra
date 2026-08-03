import { IS_TAURI } from "@avplatform/ui/constants";
import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { ActionTypesEnum } from "@/features/credits-management/constants/action-types-enum";
import { CreditServicesEnum } from "@/features/credits-management/constants/credit-service-type-enum";
import { UsageSourceTypesEnum } from "@/features/credits-management/constants/usage-source-types-enum";
import { usePostCreditConsumptionMutation } from "@/features/credits-management/hooks/usePostCreditConsumptionMutation";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useTuariUserMetadataStore } from "@/stores/tuari-user-metadata-store";

import {
  WebSocketCommandType,
  WebSocketMessageType,
  getExecutionState,
  sendExecutionComplete,
  sendNextNodeToProcess,
  sendNodeToProcess,
} from "..";
import { updateJobData } from "../apis/jobs-table-apis";
import { insertNodeExecutionLogs } from "../apis/node-execution-log-apis";
import { NodeExecutionLogDto } from "../dtos/node-execution-log-dto";
import { JobStatusEnum } from "../enums/job-status-enum";
import { useJobDataStore } from "../stores/job-data-store";

const NODE_LOG_BATCH_SIZE = 5;

export default function useWebSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const isConnected = useRef(false); // Track connection state
  const isConnecting = useRef(false);
  const pendingNodeLogs = useRef<NodeExecutionLogDto[]>([]);

  // Get setExecutionState action from current flow store
  const { currentFlow, executionState, setExecutionState } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      executionState: state.executionState,
      setExecutionState: state.setExecutionState,
    })),
  );

  const { osID } = useTuariUserMetadataStore(
    useShallow((state) => ({
      osID: state.osID,
    })),
  );

  const { startTime, endTime, status, updateField } = useJobDataStore(
    useShallow((state) => ({
      updateField: state.updateField,
      startTime: state.startTime,
      endTime: state.endTime,
      status: state.status,
    })),
  );

  const { postCreditConsumption } = usePostCreditConsumptionMutation();

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
  }, [sendCommand]);

  useEffect(() => {
    // Only run if one of the commands is pending
    if (!currExecCommand) return;

    const handleExecutionData = async () => {
      try {
        // Flush any remaining node logs before closing the job.
        await flushPendingNodeLogs(currentFlow.jobId, pendingNodeLogs.current);

        // Handle Credit Consumption
        if (currExecCommand) {
          const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

          await updateJobData({
            id: currentFlow.jobId,
            flowId: currentFlow.id,
            flowVersionId: currentFlow.versionId,
            duration,
            status,
            startTime,
            endTime,
            isPublished: false,
            osId: osID,
          });

          await postCreditConsumption([
            {
              serviceType: CreditServicesEnum[CreditServicesEnum.AgentExecutionTime],
              consumedUnit: duration,
              refType: UsageSourceTypesEnum[UsageSourceTypesEnum.Agent],
              refId: currentFlow.id,
              refName: currentFlow.name,
              action: ActionTypesEnum[ActionTypesEnum.AgentExecution],
              triggeredByAgent: currentFlow.name,
            },
          ]); // Post the consumption data
        }
      } catch (error) {
        // Log any errors that occur during the process
        console.error("Error during execution or posting credit consumption:", error);
      } finally {
        // Reset both commands after execution is done
        setCurrExecCommand(null);
      }
    };

    // Run the function to handle both tasks
    handleExecutionData();
  }, [currExecCommand]);

  useEffect(() => {
    // Only run the heartbeat if the agent is actively executing and we have a valid job ID
    if (executionState !== "executing" || !currentFlow.jobId) return;

    const syncExecutionData = async () => {
      try {
        const currentDuration = Math.round((new Date().getTime() - startTime.getTime()) / 1000);

        // Update job metadata and logs WITHOUT consuming credits
        await updateJobData({
          id: currentFlow.jobId,
          flowId: currentFlow.id,
          flowVersionId: currentFlow.versionId,
          osId: osID,
          duration: currentDuration,
          status: JobStatusEnum.Running,
          startTime: startTime,
          isPublished: false,
        });

        console.log("Heartbeat: Execution state synced to database.");
      } catch (err) {
        console.error("Heartbeat sync failed:", err);
      }
    };

    // 120,000 ms = 2 minutes
    const intervalId = setInterval(syncExecutionData, 120000);

    return () => clearInterval(intervalId);
  }, [currentFlow.jobId, currentFlow.versionId, startTime, osID, executionState]);
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
