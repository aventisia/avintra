import { useEffect, useRef, useCallback } from "react";
import { WebSocketMessage } from "./websocket-messsage";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useShallow } from "zustand/react/shallow";
import { FlowStateType } from "@/types/flow-state-literal-type";

// Create mapping of command to flow state - "execute" | "abort" | "pause" | "resume"
const commandToFlowState: Record<string, string> = {
  start: "executing",
  pause: "paused",
  resume: "executing",
  abort: "stopped",
};

export default function useWebSocket() {
  const { setFlowState } = useCurrentFlowStore(
    useShallow((state) => ({
      setFlowState: state.setFlowState,
    })),
  );

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    const socket = new WebSocket("ws://127.0.0.1:9001");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        
        if (data.source === "wpf" && data.command) {
          console.log(`Command received from WPF: ${data.command}`);

          // Update the state
          setFlowState((commandToFlowState[data.command] as FlowStateType));
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, [setFlowState]);

  const sendCommand = useCallback((command: "pause" | "resume" | "abort") => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ source: "react", command });
      socketRef.current.send(message);
      // Update the state
      setFlowState((commandToFlowState[command] as FlowStateType));
    } else {
      console.warn("WebSocket not connected");
    }
  }, [setFlowState]);

  return { sendCommand };
}
