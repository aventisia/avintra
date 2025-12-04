import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { IS_TAURI } from "@/constants/constants";
import { Execution } from "@/types/execution-types";

import {
  getExecutionState,
  saveNodeExecutionLog,
  sendExecutionComplete,
  sendNextNodeToProcess,
  sendNodeToProcess,
  WebSocketCommandType,
  WebSocketMessageType,
} from "..";
import { getLocalExecutionLog } from "../apis/get-version-execution-log";
import { useCurrentFlowStore } from "../stores/current-flow-store";
import { generateCreditConsumptionList } from "../utils/generateCreditConsumptionList";

import { usePostCreditConsumptionMutation } from "./usePostCreditConsumptionMutation";

export default function useWebSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const isConnected = useRef(false); // Track connection state

  // Get setExecutionState action from current flow store
  const { currentFlow, setExecutionState } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      setExecutionState: state.setExecutionState,
    })),
  );

  const { postCreditConsumption } = usePostCreditConsumptionMutation();

  const [pendingPostCommand, setPendingPostCommand] = useState<
    "abort" | "complete" | null
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
      // If already connected, prevent new connection
      if (isConnected.current) return;

      // Create WebSocket connection
      const wsPort = await invoke("get_websocket_port");
      socket = new WebSocket(`ws://127.0.0.1:${wsPort}`);
      socketRef.current = socket;

      // Open the connection
      socket.onopen = () => {
        // Mark as connected
        isConnected.current = true;

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
        isConnected.current = false; // Mark as disconnected, can reconnect in the future
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
    if (!pendingPostCommand) return;

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
      } catch (error) {
        // Log any errors that occur during the process
        console.error(
          "Error during execution or posting credit consumption:",
          error,
        );
      } finally {
        // Reset both commands after execution is done
        setPendingPostCommand(null);
      }
    };

    // Run the function to handle both tasks
    handleExecutionData();
  }, [
    currentFlow.id,
    currentFlow.name,
    currentFlow.versionId,
    pendingPostCommand,
    postCreditConsumption,
  ]);

  return { sendCommand };
}
