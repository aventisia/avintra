import { Button } from "@avplatform/ui/buttons";

import { FLOW_ASSISTANT_COPY } from "../constants";
import { GraphProposalDto } from "../dtos/graph-proposal-dto";
import { useApplyGraphProposal } from "../hooks/useApplyGraphProposal";

type GraphProposalCardProps = {
  proposal: GraphProposalDto;
};

export const GraphProposalCard = ({ proposal }: GraphProposalCardProps) => {
  const { validation, applyProposal, rejectProposal } = useApplyGraphProposal();

  const addedNodes = proposal.operations
    .filter((operation) => operation.type === "addNode")
    .map((operation) => operation.node);
  const updatedNodes = proposal.operations
    .filter((operation) => operation.type === "updateNode")
    .map((operation) => operation.node);
  const removedNodeCount = proposal.operations.filter(
    (operation) => operation.type === "removeNode",
  ).length;
  const addedEdgeCount = proposal.operations.filter(
    (operation) => operation.type === "addEdge",
  ).length;
  const removedEdgeCount = proposal.operations.filter(
    (operation) => operation.type === "removeEdge",
  ).length;

  const configuredFieldCount = [...addedNodes, ...updatedNodes].reduce(
    (total, node) => total + (node.inputs?.length ?? 0) + (node.outputs?.length ?? 0),
    0,
  );

  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-3xs font-medium uppercase text-primary">
          {proposal.mode}
        </span>
        <p className="text-xs font-medium text-foreground">Proposed changes</p>
      </div>

      <p className="mt-1.5 text-xs text-muted-foreground">{proposal.summary}</p>

      <div className="mt-2 flex flex-wrap gap-1">
        {addedNodes.map((node) => (
          <span
            key={`add-${node.id}`}
            className="rounded border border-primary/30 bg-primary/5 px-1.5 py-0.5 text-3xs text-foreground"
          >
            + {node.label ?? node.name ?? node.type}
          </span>
        ))}
        {updatedNodes.map((node) => (
          <span
            key={`update-${node.id}`}
            className="rounded border bg-muted px-1.5 py-0.5 text-3xs text-foreground"
          >
            ~ {node.label ?? node.name ?? node.type}
          </span>
        ))}
        {removedNodeCount > 0 && (
          <span className="rounded border border-destructive/30 bg-destructive/5 px-1.5 py-0.5 text-3xs text-destructive">
            - {removedNodeCount} node{removedNodeCount > 1 ? "s" : ""}
          </span>
        )}
        {addedEdgeCount > 0 && (
          <span className="rounded border border-dashed px-1.5 py-0.5 text-3xs text-muted-foreground">
            {addedEdgeCount} connection{addedEdgeCount > 1 ? "s" : ""}
          </span>
        )}
        {removedEdgeCount > 0 && (
          <span className="rounded border border-dashed px-1.5 py-0.5 text-3xs text-muted-foreground">
            - {removedEdgeCount} connection{removedEdgeCount > 1 ? "s" : ""}
          </span>
        )}
        {configuredFieldCount > 0 && (
          <span className="rounded border border-primary/30 bg-primary/5 px-1.5 py-0.5 text-3xs text-foreground">
            {configuredFieldCount} field{configuredFieldCount > 1 ? "s" : ""} configured
          </span>
        )}
      </div>

      {!validation.isValid && (
        <ul className="mt-2 list-disc space-y-0.5 pl-4 text-3xs text-destructive">
          {validation.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="xs" onClick={rejectProposal}>
          {FLOW_ASSISTANT_COPY.rejectLabel}
        </Button>
        <Button
          type="button"
          variant="default"
          size="xs"
          disabled={!validation.isValid}
          onClick={applyProposal}
        >
          {FLOW_ASSISTANT_COPY.applyLabel}
        </Button>
      </div>
    </div>
  );
};
