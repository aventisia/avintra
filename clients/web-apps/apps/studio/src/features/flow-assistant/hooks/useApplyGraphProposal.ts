import { useCallback, useMemo } from "react";

import { useDagreAutoLayout } from "@/hooks/useDagreAutoLayout";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { useFlowAssistantStore } from "../stores/flow-assistant-store";
import { applyGraphProposal } from "../utils/apply-graph-proposal.util";
import { applyOutputsToFlowVariables } from "../utils/flow-variables.util";
import { validateGraphProposal } from "../utils/validate-graph-proposal.util";

/** Validates and applies the pending graph proposal as a single undoable change. */
export const useApplyGraphProposal = () => {
  const autoLayout = useDagreAutoLayout();
  const pendingProposal = useFlowAssistantStore((state) => state.pendingProposal);
  const nodes = useReactFlowExtStore((state) => state.nodes);
  const edges = useReactFlowExtStore((state) => state.edges);

  const validation = useMemo(
    () =>
      pendingProposal
        ? validateGraphProposal(pendingProposal, nodes, edges)
        : { isValid: false, errors: [] as string[] },
    [pendingProposal, nodes, edges],
  );

  const applyProposal = useCallback(() => {
    const proposal = useFlowAssistantStore.getState().pendingProposal;
    if (!proposal) return;

    const {
      nodes: currentNodes,
      edges: currentEdges,
      flowVariablesObject,
    } = useReactFlowExtStore.getState();
    if (!validateGraphProposal(proposal, currentNodes, currentEdges).isValid) return;

    const { nodes: nextNodes, edges: nextEdges } = applyGraphProposal(
      currentNodes,
      currentEdges,
      proposal,
    );
    const nextFlowVariables = applyOutputsToFlowVariables(flowVariablesObject, nextNodes);
    if (nextFlowVariables !== flowVariablesObject) {
      useReactFlowExtStore.getState().setFlowVariablesObject(nextFlowVariables);
    }
    autoLayout({ newNodes: nextNodes, newEdges: nextEdges });
    useFlowAssistantStore.getState().setPendingProposal(null);
  }, [autoLayout]);

  const rejectProposal = useCallback(() => {
    useFlowAssistantStore.getState().setPendingProposal(null);
  }, []);

  return { pendingProposal, validation, applyProposal, rejectProposal };
};
