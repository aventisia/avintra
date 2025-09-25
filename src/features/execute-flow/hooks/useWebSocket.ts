import { IS_TAURI } from "@/constants";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef } from "react";
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
import { useUpdateCreditsUsedMutation } from "@/features/available-credits/updateCreditsUsedMutation";

export default function useWebSocket() {
  const socketRef = useRef<WebSocket | null>(null);

  // Get setExecutionState action from current flow store
  const { currentFlow, setExecutionState } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      setExecutionState: state.setExecutionState,
    })),
  );

  const { updateCreditsUsed } = useUpdateCreditsUsedMutation();

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

        if (command === "complete") {
          updateCreditsUsed({
            serviceType: "AgentExecution", //CreditServiceTypesEnum
            consumedUnit: 1,
            refType: "Agent", //UsageSourceTypesEnum
            refId: currentFlow?.id,
            refName: currentFlow?.name,
          });
        }

        // Update the execution state based on the command
        setExecutionState(getExecutionState(command));
      } else {
        console.warn("WebSocket not connected");
      }
    },
    [currentFlow?.id, currentFlow?.name, setExecutionState, updateCreditsUsed],
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
  }, [
    currentFlow?.id,
    currentFlow?.name,
    sendCommand,
    setExecutionState,
    updateCreditsUsed,
  ]);

  return { sendCommand };
}
