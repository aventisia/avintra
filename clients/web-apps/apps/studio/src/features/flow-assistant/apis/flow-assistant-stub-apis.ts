import { Edge, Node } from "@xyflow/react";

import { FlowAssistantRequestDto } from "../dtos/flow-assistant-request-dto";
import { GraphProposalDto } from "../dtos/graph-proposal-dto";
import { FlowAssistantFrame } from "../types/flow-assistant-frame-type";
import { GraphProposalNodeSpec, GraphProposalOperation } from "../types/graph-proposal-type";

const STUB_DELAY_MS = 180;

const ACTION_NODE_TYPES = new Set([
  "activityNode",
  "cloudConnectorNode",
  "aiNode",
  "callAgentNode",
  "blockNode",
]);

const abortableDelay = (signal: AbortSignal, ms: number): Promise<void> =>
  new Promise((resolve, reject) => {
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });

const buildCreateOperations = (): GraphProposalOperation[] => {
  const nodes: GraphProposalNodeSpec[] = [
    {
      id: "proposal-node-1",
      type: "activityNode",
      name: "GetWorkItemByIdNode",
      inputs: [{ key: "WorkItemId", value: "work-item-id" }],
    },
    { id: "proposal-node-2", type: "aiNode", name: "CreateInferencingAIAgent" },
    { id: "proposal-node-3", type: "activityNode", name: "CreateWorkItemNode" },
  ];

  return [
    ...nodes.map<GraphProposalOperation>((node) => ({ type: "addNode", node })),
    {
      type: "addEdge",
      edge: { id: "proposal-edge-1", source: "proposal-node-1", target: "proposal-node-2" },
    },
    {
      type: "addEdge",
      edge: { id: "proposal-edge-2", source: "proposal-node-2", target: "proposal-node-3" },
    },
  ];
};

const buildEditOperations = (nodes: Node[], edges: Edge[]): GraphProposalOperation[] => {
  const anchor = nodes.find(
    (node) =>
      ACTION_NODE_TYPES.has(node.type ?? "") &&
      edges.some((edge) => edge.source === node.id && !edge.data?.isTemporary),
  );

  if (!anchor) return buildCreateOperations();

  const outgoing = edges.find((edge) => edge.source === anchor.id && !edge.data?.isTemporary);
  const operations: GraphProposalOperation[] = [
    {
      type: "addNode",
      node: { id: "proposal-node-1", type: "activityNode", name: "CreateWorkItemNode" },
    },
  ];

  if (outgoing) {
    operations.push(
      { type: "removeEdge", id: outgoing.id },
      {
        type: "addEdge",
        edge: { id: "proposal-edge-1", source: anchor.id, target: "proposal-node-1" },
      },
      {
        type: "addEdge",
        edge: { id: "proposal-edge-2", source: "proposal-node-1", target: outgoing.target },
      },
    );
  } else {
    operations.push({
      type: "addEdge",
      edge: { id: "proposal-edge-1", source: anchor.id, target: "proposal-node-1" },
    });
  }

  return operations;
};

const buildStubProposal = (request: FlowAssistantRequestDto): GraphProposalDto => {
  const { nodes, edges } = request.graphContext;
  const hasActionNodes = nodes.some((node) => ACTION_NODE_TYPES.has(node.type ?? ""));
  const mode = hasActionNodes ? "edit" : "create";

  return {
    id: window.crypto.randomUUID(),
    summary:
      mode === "create"
        ? "Create a flow that reads a work item, runs it through Text AI, and creates a follow-up work item."
        : "Insert a Create Work Item step into the existing flow.",
    mode,
    operations: mode === "create" ? buildCreateOperations() : buildEditOperations(nodes, edges),
  };
};

/**
 * Deterministic local stand-in for the flow-assistant SSE endpoint.
 *
 * @param request The flow-assistant request payload.
 * @param signal Optional AbortController signal to cancel the stream.
 */
export async function* streamFlowAssistantStub(
  request: FlowAssistantRequestDto,
  signal: AbortSignal,
): AsyncGenerator<FlowAssistantFrame> {
  const proposal = buildStubProposal(request);
  const message = `${proposal.summary} Review the proposal below, then apply it to the canvas.`;

  for (const word of message.split(" ")) {
    await abortableDelay(signal, STUB_DELAY_MS);
    yield { type: "delta", output: `${word} ` };
  }

  await abortableDelay(signal, STUB_DELAY_MS);
  yield { type: "graph_proposal", output: proposal };
  yield { type: "done" };
}
