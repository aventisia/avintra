import { IS_TAURI } from "@/constants";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  getExecutionState,
  saveNodeExecutionLog,
  sendExecutionComplete,
  sendNextNodeToProcess,
  sendNodeToProcess,
  WebSocketCommandType,
  WebSocketMessageType,
} from "..";
import { usePostCreditConsumptionMutation } from "@/features/credits-management/hooks/usePostCreditConsumptionMutation";
import { generateCreditConsumptionList } from "@/features/credits-management/utils/generateCreditConsumptionList";
import { getLocalExecutionLog } from "@/features/flow-execution-log/apis/get-version-execution-log";
import { Execution } from "@/features/flow-execution-log/types/execution-types";
import { useExecutionLogTableStore } from "@/features/flow-execution-log/stores/execution-log-table-store";
import { ExecutionStatusTypesEnum } from "@/features/flow-execution-log/constants/execution-status-type-enum";
import { insertExecution } from "@/features/flow-execution-log/apis/executions-table-apis";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { getAgentExecutionDuration } from "@/features/credits-management/utils/getAgentExecutionDuration";

export default function useWebSocket() {
  const socketRef = useRef<WebSocket | null>(null);

  // Get setExecutionState action from current flow store
  const { currentFlow, setExecutionState } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      setExecutionState: state.setExecutionState,
    })),
  );

  const { startTime, endTime, status, updateField } = useExecutionLogTableStore(
    useShallow((state) => ({
      updateField: state.updateField,
      startTime: state.startTime,
      endTime: state.endTime,
      status: state.status,
    })),
  );

  // Get user session state and actions
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const { postCreditConsumption } = usePostCreditConsumptionMutation();

  const [pendingPostCommand, setPendingPostCommand] = useState<
    "abort" | "complete" | null
  >(null);

  const [pendingInsertCommand, setPendingInsertCommand] = useState<
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

        if (command === "abort" || command === "complete") {
          setPendingPostCommand(command); // for credits
        }

        if (command === "start") {
          updateField("startTime", new Date());
        }

        if (
          command === "abort" ||
          command === "error" ||
          command === "complete"
        ) {
          const endTime = new Date();
          const status =
            command === "complete"
              ? ExecutionStatusTypesEnum.Succeeded
              : ExecutionStatusTypesEnum.Failed;

          updateField("endTime", endTime);
          updateField("status", status);
          setPendingInsertCommand(command); // trigger insert effect
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
      socket.onmessage = (event: MessageEvent) => {
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
              sendExecutionComplete(msg.command, sendCommand);
              break;
            case "start":
              sendNextNodeToProcess(sendCommand);
              break;
            case "save-execution-log":
              saveNodeExecutionLog(msg.data || "{}");
              break;
            default:
              console.log("Unknown command:", msg.data);
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
  }, [sendCommand, setExecutionState]);

  useEffect(() => {
    // Only run if one of the commands is pending
    if (!pendingPostCommand && !pendingInsertCommand) return;

    const handleExecutionData = async () => {
      try {
        // Fetch execution logs for the current flow version
        const localLogs = await getLocalExecutionLog(currentFlow.versionId);
        const executionData: Execution[] = localLogs ?? [];

        // Handle Credit Consumption
        if (pendingPostCommand) {
          const consumptionList = generateCreditConsumptionList(
            executionData,
            currentFlow.id,
            currentFlow.name,
            pendingPostCommand,
          );

          if (consumptionList) {
            await postCreditConsumption(consumptionList); // Post the consumption data
            console.log("Credit consumption posted successfully.");
          } else {
            console.warn("No credit consumption data generated.");
          }
        }

        // Handle Execution Log Insertion
        if (pendingInsertCommand) {
          // Calculate execution duration
          const duration = getAgentExecutionDuration(
            executionData[0]?.nodes || [],
          );
          await insertExecution({
            flowVersionId: currentFlow.versionId,
            name: currentFlow.name,
            status,
            endTime,
            startTime,
            duration,
            version: currentFlow.versionNumber,
            flowId: currentFlow.id,
            executedBy: `${userSession?.firstName} ${userSession?.lastName}`,
            executedOn: startTime,
            executionType: "Manual", // TODO: Update based on actual execution type
          });

          console.log("Execution log inserted successfully.");
        }
      } catch (error) {
        // Log any errors that occur during the process
        console.error(
          "Error during execution or posting credit consumption:",
          error,
        );
      } finally {
        // Reset both commands after execution is done
        setPendingPostCommand(null);
        setPendingInsertCommand(null);
      }
    };

    // Run the function to handle both tasks
    handleExecutionData();
  }, [
    currentFlow.id,
    currentFlow.name,
    currentFlow.versionId,
    currentFlow.versionNumber,
    endTime,
    pendingInsertCommand,
    pendingPostCommand,
    postCreditConsumption,
    startTime,
    status,
    userSession?.firstName,
    userSession?.lastName,
  ]);

  return { sendCommand };
}
