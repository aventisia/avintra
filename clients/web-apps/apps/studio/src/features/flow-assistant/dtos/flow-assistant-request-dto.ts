import { Edge, Node } from "@xyflow/react";

/** Request payload for a flow-assistant turn. */
export interface FlowAssistantRequestDto {
  flowVersionId: string;
  flowId: string;
  userInput: string;
  threadMessages: { role: "user" | "assistant"; content: string }[];
  graphContext: { nodes: Node[]; edges: Edge[] };
}
