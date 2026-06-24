import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { IS_TAURI } from "@/constants";
import { ActionTypesEnum } from "@/features/credits-management/constants/action-types-enum";
import { CreditServiceTypesEnum } from "@/features/credits-management/constants/credit-service-type-enum";
import { UsageSourceTypesEnum } from "@/features/credits-management/constants/usage-source-types-enum";
import { usePostCreditConsumptionMutation } from "@/features/credits-management/hooks/usePostCreditConsumptionMutation";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import {
  WebSocketCommandType,
  WebSocketMessageType,
  getExecutionState,
  saveNodeExecutionLog,
  sendExecutionComplete,
  sendNextNodeToProcess,
  sendNodeToProcess,
} from "..";
import { getLocalExecutionLog } from "../apis/get-version-execution-log";
import { insertJob } from "../apis/jobs-table-apis";
import { JobStatusTypesEnum } from "../enums/job-status-type-enum";
import { useJobDataStore } from "../stores/job-data-store";
import { ExecutionNode } from "../types/execution-types";

export default function useWebSocket() {
  const socketRef = useRef<WebSocket | null>(null);

  // Get setExecutionState action from current flow store
  const { currentFlow, setExecutionState } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
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
              ? JobStatusTypesEnum.Completed
              : command === "abort"
                ? JobStatusTypesEnum.Abort
                : JobStatusTypesEnum.Failed;

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

    let socket: WebSocket | null = null;

    const connect = async () => {
      // Create WebSocket connection
      const wsPort = await invoke("get_websocket_port");
      socket = new WebSocket(`ws://127.0.0.1:${wsPort}`);
      socketRef.current = socket;

      // Open the connection
      socket.onopen = () => {
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
              sendNodeToProcess(msg.data || "nodeId", sendCommand);
              break;
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      // Handle errors
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      // Handle connection close
      socket.onclose = () => {
        console.log("WebSocket disconnected");
      };
    };

    connect();

    // Cleanup function to close the socket when the component unmounts
    return () => {
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
          await insertJob({
            flowId: currentFlow.id,
            flowVersionId: currentFlow.versionId,
            duration,
            status,
            startTime,
            endTime,
            isPublished: false,
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
          console.log("Credit consumption posted successfully.");
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
  }, [currExecCommand]);

  return { sendCommand };
}
