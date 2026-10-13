import { Edge, Node } from "@xyflow/react";

import { FlowAssistantReferenceDataDto } from "./flow-assistant-reference-data-dto";

/** Request payload for a flow-assistant turn. */
export interface FlowAssistantRequestDto {
  flowVersionId: string;
  flowId: string;
  userInput: string;
  threadMessages: { role: "user" | "assistant"; content: string }[];
  graphContext: { nodes: Node[]; edges: Edge[] };
  selectedNodeId?: string;
  referenceData?: FlowAssistantReferenceDataDto;
  modelId: string;
}
