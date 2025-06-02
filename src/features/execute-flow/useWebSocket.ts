import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { FlowStateType } from "@/types/flow-state-literal-type";
import { NodeDataType } from "@/types/node-data-type";
import { Node } from "@xyflow/react";
import { useCallback, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { getActivityNodeData } from "./get-activity-node-data";
import { WebSocketMessage } from "./websocket-messsage";
import { useTauriStore } from "@/stores/tauri-store";

// Create mapping of command to flow state - "start" | "abort" | "pause" | "resume"
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

  // Get ReactFlowExt store state & actions
  const { nodes, edges } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
    })),
  );

  // Get the state if app is open in tauri window
  const { isTauri } = useTauriStore(
    useShallow((state) => ({
      isTauri: state.isTauri,
    })),
  );

  const socketRef = useRef<WebSocket | null>(null);

  const sendCommand = useCallback(
    (command: "pause" | "resume" | "abort" | "nextnode", data?: string) => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        const message = JSON.stringify({ source: "react", command, data });
        socketRef.current.send(message);
        // Update the state
        setFlowState(commandToFlowState[command] as FlowStateType);
      } else {
        console.warn("WebSocket not connected");
      }
    },
    [setFlowState],
  );

  // Get the first node from Nodes list
  const sendFirstNode = useCallback(() => {
    // Get trigger node id
    const triggerNodeId = nodes.find((node) => node.type === "triggerNode")?.id;

    // Get edge id of trigger node
    const triggerNodeEdge = edges.find((edge) => edge.source === triggerNodeId);

    // Get the target node id
    const targetNodeId = triggerNodeEdge?.target;

    // Get the target node
    const targetNode = nodes.find(
      (node) => node.id === targetNodeId,
    ) as Node<NodeDataType>;

    // Get activity node data
    const nodeData = getActivityNodeData(targetNode);

    sendCommand("nextnode", JSON.stringify(nodeData));
  }, [nodes, edges, sendCommand]);

  // Get the next node from Nodes list
  const sendNextNode = useCallback(
    (preNodeId: string) => {
      // Get edge of preNode node
      const preNodeEdge = edges.find((edge) => edge.source === preNodeId);

      // If we don't have an edge, return send abort command
      if (!preNodeEdge) {
        console.warn("No edge found for preNode");
        sendCommand("abort");
        return;
      }

      // Get the target node id
      const targetNodeId = preNodeEdge?.target;

      // Get the target node
      const targetNode = nodes.find(
        (node) => node.id === targetNodeId,
      ) as Node<NodeDataType>;

      // Get activity node data
      const nodeData = getActivityNodeData(targetNode);

      sendCommand("nextnode", JSON.stringify(nodeData));
    },
    [edges, nodes, sendCommand],
  );

  useEffect(() => {
    // If the app is running in a Tauri window only then create a WebSocket connection
    if (!isTauri) return;

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
          if (
            data.command === "start" ||
            data.command === "abort" ||
            data.command === "pause" ||
            data.command === "resume"
          ) {
            // Update the state
            setFlowState(commandToFlowState[data.command] as FlowStateType);
          }

          if (data.command === "start") {
            sendFirstNode();
          } else if (data.command === "nextnode") {
            sendNextNode(data.data || "id");
          }
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
  }, [sendFirstNode, sendNextNode, setFlowState]);

  return { sendCommand };
}
