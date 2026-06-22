import { toast } from "@aventisia/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Node } from "@xyflow/react";
import { useCallback } from "react";

import { fetchConfigKeyValuePairs } from "@/features/execute-flow/apis/config-store-apis";
import { ConfigKeyValueDto } from "@/features/execute-flow/dtos/config-key-value-dto";
import { NodeDataType } from "@/types/node-data-type";

import { getFlowToLoad } from "../apis/react-flow-apis";
import { NodeInputType } from "../types/node-input-type";
import { extractUniqueConfigKeys } from "../utils/config-key-utils";
import { deepParse } from "../utils/deepParse";

const CONFIG_KEY_PREFIX = "__config__";
const SUBFLOW_NODE_TYPES = new Set(["blockNode", "callAgentNode"]);

type SubflowReference = {
  flowId: string;
  versionId?: string;
};

const isSubflowNode = (node: Node<NodeDataType>) =>
  SUBFLOW_NODE_TYPES.has(node?.type ?? "");

const getSubflowReference = (
  node: Node<NodeDataType>,
): SubflowReference | null => {
  if (node.type === "blockNode") {
    const selectedBlock = node.data?.selectedBlock;
    if (selectedBlock?.flowId || selectedBlock?.id) {
      return {
        flowId: selectedBlock.flowId ?? selectedBlock.id,
        versionId: selectedBlock.flowId ? selectedBlock.id : undefined,
      };
    }
  }

  if (node.type === "callAgentNode") {
    const selectedAgent = node.data?.selectedAgent;
    if (selectedAgent?.flowId || selectedAgent?.id) {
      return {
        flowId: selectedAgent.flowId ?? selectedAgent.id,
        versionId: selectedAgent.flowId ? selectedAgent.id : undefined,
      };
    }
  }

  return null;
};

const toFlowNodes = (reactFlowObject: unknown): Node<NodeDataType>[] => {
  const parsedFlow = deepParse(String(reactFlowObject ?? "{}")) as {
    nodes?: Node<NodeDataType>[];
  } | null;

  if (!parsedFlow || !Array.isArray(parsedFlow.nodes)) {
    return [];
  }

  return parsedFlow.nodes;
};

/**
 * Builds initial inputs for execution context from config placeholders found in flow nodes.
 */
export const useConfigKeyValuePairsInputs = () => {
  const queryClient = useQueryClient();

  const collectAllNodesRecursively = useCallback(
    async (rootNodes: Node<NodeDataType>[]): Promise<Node<NodeDataType>[]> => {
      const mergedNodes: Node<NodeDataType>[] = [...rootNodes];
      const nodesToVisit: Node<NodeDataType>[] = [...rootNodes];
      const visitedSubflows = new Set<string>();

      while (nodesToVisit.length > 0) {
        const currentNode = nodesToVisit.shift();

        if (!currentNode || !isSubflowNode(currentNode)) {
          continue;
        }

        const subflowReference = getSubflowReference(currentNode);

        if (!subflowReference?.flowId) {
          continue;
        }

        const subflowKey = `${subflowReference.flowId}:${subflowReference.versionId ?? "latest"}`;

        if (visitedSubflows.has(subflowKey)) {
          continue;
        }

        visitedSubflows.add(subflowKey);

        try {
          const flowResponse = await queryClient.fetchQuery({
            queryKey: [
              "FLOW",
              "LOAD",
              subflowReference.flowId,
              subflowReference.versionId ?? "latest",
            ],
            queryFn: () =>
              getFlowToLoad(
                subflowReference.flowId,
                subflowReference.versionId,
              ),
          });

          const subflowNodes = toFlowNodes(flowResponse?.data?.reactFlowObject);

          if (!subflowNodes.length) {
            continue;
          }

          mergedNodes.push(...subflowNodes);
          nodesToVisit.push(...subflowNodes);
        } catch (error) {
          console.error(
            `Failed to load subflow ${subflowReference.flowId}:`,
            error,
          );
        }
      }

      return mergedNodes;
    },
    [queryClient],
  );

  const getConfigKeyValuePairsInputs = useCallback(
    async (nodes: Node<NodeDataType>[]): Promise<NodeInputType[]> => {
      const allNodes = await collectAllNodesRecursively(nodes);
      const configKeys = extractUniqueConfigKeys(allNodes);

      if (!configKeys.length) {
        return [];
      }

      try {
        const configKeyValuePairs = await queryClient.fetchQuery({
          queryKey: ["CONFIG_STORE", "FETCH", ...configKeys.sort()],
          queryFn: () => fetchConfigKeyValuePairs(configKeys),
        });

        const configKeyValueByName = new Map<string, unknown>(
          (configKeyValuePairs?.data ?? [])
            .filter((item: ConfigKeyValueDto) => item?.key)
            .map(
              (item: ConfigKeyValueDto) =>
                [item.key, item.value ?? ""] as const,
            ),
        );

        return configKeys.map((key) => ({
          key: `${CONFIG_KEY_PREFIX}${key}`,
          value: configKeyValueByName.get(key) ?? "",
        }));
      } catch (error) {
        console.error("Failed to fetch config key inputs:", error);
        toast.error("Failed to resolve config keys from Key Store.");
        return [];
      }
    },
    [collectAllNodesRecursively, queryClient],
  );

  return { getConfigKeyValuePairsInputs };
};
