import { IS_TAURI } from "@aventisia/ui/constants";
import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { JobStatusEnum } from "@/features/03-orchestrator/jobs-table/enums/job-status-enum";
import { ExecutionNode } from "@/types/execution-types";

import {
  WebSocketCommandType,
  WebSocketMessageType,
  getExecutionState,
  markLogAsSynced,
  saveNodeExecutionLog,
  sendExecutionComplete,
  sendNextNodeToProcess,
  sendNodeToProcess,
} from "..";
import { updateJobData } from "../apis/job-trigger-apis";
import { ActionTypesEnum } from "../constants/action-types-enum";
import { CreditServiceTypesEnum } from "../constants/credit-service-type-enum";
import { UsageSourceTypesEnum } from "../constants/usage-source-types-enum";
import { useCurrentFlowStore } from "../stores/current-flow-store";
import { useJobDataStore } from "../stores/job-data-store";
import { getLocalExecutionLog } from "../utils/get-version-execution-log";
import { usePostCreditConsumptionMutation } from "./usePostCreditConsumptionMutation";

export default function useWebSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const isConnected = useRef(false); // Track connection state
  const isConnecting = useRef(false);

  // Get setExecutionState action from current flow store
  const { currentFlow, executionState, setExecutionState } =
    useCurrentFlowStore(
      useShallow((state) => ({
        currentFlow: state.currentFlow,
        executionState: state.executionState,
        setExecutionState: state.setExecutionState,
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

  const [currExecCommand, setCurrExecCommand] = useState<
    "abort" | "complete" | "error" | null
  >(null);

  // Function to send command to web socket
  const sendCommand = useCallback(
    (command: WebSocketCommandType, data?: string) => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        // Send the message as a string
        socketRef.current.send(
          JSON.stringify({
            source: "react",
            command,
            data,
          }),
        );

        if (
          command === "abort" ||
          command === "complete" ||
          command == "error"
        ) {
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
              await saveNodeExecutionLog(msg.data || "{}");
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
        // Fetch execution logs for the current flow version
        const localLogs = await getLocalExecutionLog(currentFlow.versionId);
        let executionData: ExecutionNode[] = [];

        if (Array.isArray(localLogs) && localLogs.length > 0) {
          executionData = localLogs[0].nodes ?? [];
        }

        // Handle Credit Consumption
        if (currExecCommand) {
          const duration = Math.round(
            (endTime.getTime() - startTime.getTime()) / 1000,
          );

          await updateJobData({
            flowId: currentFlow.id,
            flowVersionId: currentFlow.versionId,
            id: currentFlow.jobId,
            machineId: currentFlow.machineId,
            duration,
            status,
            startTime,
            endTime,
            isPublished: true,
            nodeExecutionLogs: JSON.stringify(executionData),
          });

          await postCreditConsumption([
            {
              serviceType:
                CreditServiceTypesEnum[
                  CreditServiceTypesEnum.AgentExecutionTime
                ],
              consumedUnit: duration,
              refType: UsageSourceTypesEnum[UsageSourceTypesEnum.Agent],
              refId: currentFlow.id,
              refName: currentFlow.name,
              action: ActionTypesEnum[ActionTypesEnum.AgentExecution],
              triggeredByAgent: currentFlow.name,
            },
          ]); // Post the consumption data
          // mark the job log pushed to backend
          await markLogAsSynced(currentFlow.jobId || "jobId-unknown");
        }
      } catch (error) {
        // Log any errors that occur during the process
        console.error(
          "Error during execution or posting credit consumption:",
          error,
        );
      } finally {
        // Reset both commands after execution is done
        setCurrExecCommand(null);
      }
    };

    // Run the function to handle both tasks
    handleExecutionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currExecCommand]);

  useEffect(() => {
    // Only run the heartbeat if the agent is actively executing and we have a valid job ID
    if (executionState !== "executing" || !currentFlow.jobId) return;

    const syncExecutionData = async () => {
      try {
        const currentDuration = Math.round(
          (new Date().getTime() - startTime.getTime()) / 1000,
        );

        // Update job metadata and logs WITHOUT consuming credits
        await updateJobData({
          id: currentFlow.jobId,
          flowId: currentFlow.id,
          flowVersionId: currentFlow.versionId,
          machineId: currentFlow.machineId,
          duration: currentDuration,
          status: JobStatusEnum.Running,
          startTime: startTime,
          isPublished: true,
        });

        console.log("Heartbeat: Execution state synced to database.");
      } catch (err) {
        console.error("Heartbeat sync failed:", err);
      }
    };

    // 120,000 ms = 2 minutes
    const intervalId = setInterval(syncExecutionData, 120000);

    return () => clearInterval(intervalId);
  }, [
    currentFlow.id,
    currentFlow.jobId,
    currentFlow.machineId,
    currentFlow.versionId,
    executionState,
    startTime,
  ]);

  return { sendCommand };
}
