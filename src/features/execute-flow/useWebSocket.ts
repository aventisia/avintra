import { useEffect, useRef, useCallback } from "react";
import { WebSocketMessage } from "./websocket-messsage";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useShallow } from "zustand/react/shallow";
import { FlowStateType } from "@/types/flow-state-literal-type";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { getActivityNodeData } from "./get-activity-node-data";
import { Node } from "@xyflow/react";
import { ActivityNodeDataType } from "@/types/activity-node-data-type";

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
    console.log("Trigger node id", triggerNodeId);

    // Get edge id of trigger node
    const triggerNodeEdge = edges.find(
      (edge) => edge.source === triggerNodeId,
    );

    console.log("Trigger node edge", triggerNodeEdge);

    // Get the target node id
    const targetNodeId = triggerNodeEdge?.target;

    console.log("Target node id", targetNodeId);

    // Get the target node
    const targetNode = nodes.find((node) => node.id === targetNodeId) as Node<ActivityNodeDataType>;

    // Get activity node data
    const nodeData = getActivityNodeData(targetNode);

    console.log("Node data", nodeData);

    sendCommand("nextnode", JSON.stringify(nodeData));
  }, [nodes, edges, sendCommand]);

  // Get the next node from Nodes list
  const sendNextNode = useCallback((preNodeId: string) => {
    // Get edge of preNode node
    const preNodeEdge = edges.find(
      (edge) => edge.source === preNodeId,
    );

    // Get the target node id
    const targetNodeId = preNodeEdge?.target;

    // Get the target node
    const targetNode = nodes.find((node) => node.id === targetNodeId) as Node<ActivityNodeDataType>;

    // Get activity node data
    const nodeData = getActivityNodeData(targetNode);

    sendCommand("nextnode", JSON.stringify(nodeData));
  }, [edges, nodes, sendCommand]);

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
            console.log("Sending first node to WPF");
            sendFirstNode();
          } else if (data.command === "nextnode") {
            console.log("Sending next node to WPF", data.data);
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
