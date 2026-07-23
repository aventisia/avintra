import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { Edge, Node } from "@xyflow/react";
import { set } from "idb-keyval";
import { useCallback } from "react";

import { NodeDataType } from "@/types/node-data-type";

import { fetchSubFlows } from "../apis/flow-builder-apis";
import { SUB_FLOW_GRAPH_DB_KEY } from "../constants/constants";
import { SubFlowGraph } from "../types/sub-flow-graph";
import { deepParse } from "../utils/deepParse";

const SUBFLOW_NODE_TYPES = new Set(["blockNode", "callAgentNode"]);

type ParsedFlowGraph = {
  nodes: Node<NodeDataType>[];
  edges: Edge[];
};

const extractSubFlowVersionIds = (nodes: Node<NodeDataType>[]): string[] => {
  const subFlowVersionIds = new Set<string>();

  nodes.forEach((node) => {
    if (!SUBFLOW_NODE_TYPES.has(node?.type ?? "")) {
      return;
    }

    const nodeData = node.data as NodeDataType;

    if (node.type === "callAgentNode" && nodeData?.selectedAgent?.id) {
      subFlowVersionIds.add(nodeData.selectedAgent.id);
    }

    if (node.type === "blockNode" && nodeData?.selectedBlock?.id) {
      subFlowVersionIds.add(nodeData.selectedBlock.id);
    }
  });

  return Array.from(subFlowVersionIds);
};

const parseFlowGraph = (reactFlowObject?: string | null): ParsedFlowGraph => {
  const parsedFlow = deepParse(String(reactFlowObject ?? "{}")) as {
    nodes?: Node<NodeDataType>[];
    edges?: Edge[];
  } | null;

  return {
    nodes: Array.isArray(parsedFlow?.nodes) ? parsedFlow.nodes : [],
    edges: Array.isArray(parsedFlow?.edges) ? parsedFlow.edges : [],
  };
};

const useFetchSubFlows = () => {
  const { mutateAsync: fetchSubFlowsMutationAsync, isPending } = useMutation({
    mutationFn: fetchSubFlows,
  });

  const fetchAndStoreSubFlows = useCallback(
    async (parentNodes: Node<NodeDataType>[]): Promise<SubFlowGraph[]> => {
      const subFlowMap = new Map<string, SubFlowGraph>();
      const processedSubFlowIds = new Set<string>();
      let pendingSubFlowIds = extractSubFlowVersionIds(parentNodes);

      while (pendingSubFlowIds.length > 0) {
        const subFlowIdsToFetch = pendingSubFlowIds.filter(
          (subFlowId) => !processedSubFlowIds.has(subFlowId),
        );

        if (!subFlowIdsToFetch.length) {
          break;
        }

        subFlowIdsToFetch.forEach((subFlowId) => {
          processedSubFlowIds.add(subFlowId);
        });

        const response = await fetchSubFlowsMutationAsync(subFlowIdsToFetch);
        const fetchedSubFlows = response?.data ?? [];
        const nextLevelSubFlowIds = new Set<string>();

        fetchedSubFlows.forEach((subFlow) => {
          if (!subFlow?.flowVersionId) {
            return;
          }

          const parsedFlow = parseFlowGraph(subFlow.reactFlowObject);

          subFlowMap.set(subFlow.flowVersionId, {
            subFlowId: subFlow.flowVersionId,
            nodes: parsedFlow.nodes,
            edges: parsedFlow.edges,
          });

          extractSubFlowVersionIds(parsedFlow.nodes).forEach((nestedSubFlowId) => {
            if (!processedSubFlowIds.has(nestedSubFlowId)) {
              nextLevelSubFlowIds.add(nestedSubFlowId);
            }
          });
        });

        pendingSubFlowIds = Array.from(nextLevelSubFlowIds);
      }

      const subFlowGraphs = Array.from(subFlowMap.values());
      await set(SUB_FLOW_GRAPH_DB_KEY, subFlowGraphs);

      return subFlowGraphs;
    },
    [fetchSubFlowsMutationAsync],
  );

  const fetchAndStoreSubFlowsSafely = useCallback(
    async (parentNodes: Node<NodeDataType>[]) => {
      try {
        return await fetchAndStoreSubFlows(parentNodes);
      } catch (error) {
        toast.error(`Failed to fetch sub-flow data. Please try again. Error: ${error}`);
        throw error;
      }
    },
    [fetchAndStoreSubFlows],
  );

  return {
    isPending,
    fetchAndStoreSubFlows: fetchAndStoreSubFlowsSafely,
  };
};

export { useFetchSubFlows };
