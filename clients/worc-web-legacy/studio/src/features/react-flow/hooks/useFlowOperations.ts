import { useDagreAutoLayout } from "@/hooks/useDagreAutoLayout";
import { useContextMenuActionsStore } from "@/stores/context-menu-actions-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";
import { FlowVariablesObjectType } from "@/types/flow-variables-object-type";
import { NodeDataType } from "@/types/node-data-type";
import { createCustomEdgeObj } from "@/utils/create-edges/create-custom-edge-obj";
import { createPlusEdgeObj } from "@/utils/create-edges/create-plus-edge-obj";

import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { toast } from "@aventisia/ui/sonner";
import { Edge, Node, useReactFlow } from "@xyflow/react";
import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useClipboardStore } from "../stores/useClipboardStore";
import { generatePastedSubgraph } from "../utils/clipboardUtils";
import { getBranchSubgraphNodeIds } from "../utils/getBranchSubNodeIds";
import { getIntermediateNodeIds } from "../utils/getIntermediateNodes";
import { getNodesAndEdgesAfterDeletion } from "../utils/getNodesAndEdgesAfterDeletion";
import {
  deduplicateEdges,
  getComprehensiveSelection,
  rebuildBypassEdges,
} from "../utils/node-deletion-utils";
import { useOrderedSelection } from "./useOrderedSelection";

const flowEventChannel = new BroadcastChannel("react-flow-cross-tab-events");

// ─── Module-level helpers ─────────────────────────────────────────────────

// conditionalNode and forLoopNode own subgraphs (branches/loop body).
// When deleting a set of nodes, these must be processed first so their
// subgraph teardown runs before any of their child nodes are visited.
const sortDeleteFirst = (nodes: Node[]): Node[] =>
  [...nodes].sort((a, b) => {
    const aFirst = a.type === "conditionalNode" || a.type === "forLoopNode";
    const bFirst = b.type === "conditionalNode" || b.type === "forLoopNode";
    if (aFirst && !bFirst) return -1;
    if (!aFirst && bFirst) return 1;
    return 0;
  });

// Run getNodesAndEdgesAfterDeletion sequentially over a list of nodes.
// Each iteration feeds its output into the next, so subgraph teardowns
// from earlier nodes are reflected when later nodes are processed.
const runSequentialDeletion = (
  initialNodes: Node[],
  initialEdges: Edge[],
  initialVars: FlowVariablesObjectType[],
  nodesToRemove: Node[],
) => {
  let nodes = initialNodes;
  let edges = initialEdges;
  let flowVariables = initialVars;

  sortDeleteFirst(nodesToRemove).forEach((nodeToRemove) => {
    if (!nodes.some((n) => n.id === nodeToRemove.id)) return;
    const result = getNodesAndEdgesAfterDeletion({
      node: nodeToRemove,
      nodes,
      edges,
      flowVariables,
      allowBranchDeletion: true,
    });
    nodes = result.updatedNodes;
    edges = result.updatedEdges;
    flowVariables = result.updatedFlowVariables;
  });

  return { nodes, edges, flowVariables };
};

// Pure edge cloner — used when inserting pasted subgraphs into the flow.
const cloneEdgeObj = (
  original: Edge,
  source: string,
  target: string,
): Edge => ({
  ...original,
  id: window.crypto.randomUUID(),
  source,
  target,
});

// ─── Hook ─────────────────────────────────────────────────────────────────

export const useFlowOperations = () => {
  const { nodes, setFlowVariablesObject, setNodes, setEdges } =
    useReactFlowExtStore();

  const { updateNodeData } = useReactFlow();

  const { selectedNode, setMenu, setSelectedNode, setSelectedEdge } =
    useContextMenuActionsStore(
      useShallow((state) => ({
        selectedNode: state.selectedNode,
        setMenu: state.setMenu,
        setSelectedNode: state.setSelectedNode,
        setSelectedEdge: state.setSelectedEdge,
      })),
    );

  const { deleteAlert } = useStudioPreferencesStore(
    useShallow((state) => ({
      deleteAlert: state.studioPreferences.deleteAlert,
    })),
  );

  const autoLayout = useDagreAutoLayout();
  const { setClipboard, clearClipboard } = useClipboardStore();
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const orderedSelectedIds = useOrderedSelection(nodes);

  const resetContextMenu = useCallback(() => {
    setMenu(null);
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setMenu, setSelectedEdge, setSelectedNode]);

  const clearCutNodes = useCallback(() => {
    const cutNodes = nodes.filter((n) => n.data?.isCut === true);
    if (cutNodes.length === 0) return;
    cutNodes.forEach((n) => updateNodeData(n.id, { isCut: false }));
  }, [nodes]);

  useEffect(() => {
    const handleChannelMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;

      if (type === "CLIPBOARD_CLEARED") {
        clearCutNodes();
      }

      if (type === "CUT_NODES_PASTED" && payload?.nodes) {
        try {
          const clipboardNodes = payload.nodes as Node[];
          const {
            nodes: currentNodes,
            edges: currentEdges,
            setNodes,
            setEdges,
            flowVariablesObject: currentVariables,
          } = useReactFlowExtStore.getState();
          const oldNodeIds = new Set(clipboardNodes.map((n) => n.id));

          if (!currentNodes.some((n) => oldNodeIds.has(n.id))) return;

          let nextNodes = [...currentNodes];
          let nextEdges = currentEdges.filter((e) => !e.data?.isTemporary);

          // Adjust group head counts for any group members being cut
          const groupsAffected = new Map<string, number>();
          clipboardNodes.forEach((n) => {
            if (!n.data?.clipboardGroupId || n.data.clipboardGroupHead) return;
            const isHeadMoved = clipboardNodes.some(
              (cn) =>
                cn.data?.clipboardGroupId === n.data?.clipboardGroupId &&
                cn.data?.clipboardGroupHead,
            );
            if (!isHeadMoved)
              groupsAffected.set(
                n.data.clipboardGroupId as string,
                (groupsAffected.get(n.data.clipboardGroupId as string) || 0) +
                  1,
              );
          });
          groupsAffected.forEach((removedCount, gId) => {
            const idx = nextNodes.findIndex(
              (n) => n.data?.groupId === gId && n.data?.isGroupHead,
            );
            if (idx === -1) return;
            const currentCount = (nextNodes[idx].data.count as number) || 1;
            nextNodes[idx] = {
              ...nextNodes[idx],
              data: {
                ...nextNodes[idx].data,
                count: Math.max(1, currentCount - removedCount),
              },
            };
          });

          const nodesToRemove = nextNodes.filter((n) => oldNodeIds.has(n.id));
          const result = runSequentialDeletion(
            nextNodes,
            nextEdges,
            [...currentVariables],
            nodesToRemove,
          );
          nextNodes = result.nodes;
          nextEdges = rebuildBypassEdges(result.nodes, result.edges);
          nextEdges = deduplicateEdges(nextEdges);

          setNodes(nextNodes);
          setEdges(nextEdges);
          autoLayout({ newNodes: nextNodes, newEdges: nextEdges });
        } catch (err) {
          console.error("Cross-tab cut sync failed", err);
        }
      }
    };

    flowEventChannel.addEventListener("message", handleChannelMessage);
    return () =>
      flowEventChannel.removeEventListener("message", handleChannelMessage);
  }, [clearCutNodes, autoLayout]);

  const cancelCut = useCallback(() => {
    clearCutNodes();
    clearClipboard();
    flowEventChannel.postMessage({ type: "CLIPBOARD_CLEARED" });
  }, [clearCutNodes, clearClipboard]);

  const getTargetIds = useCallback(() => {
    if (selectedNode) {
      if (orderedSelectedIds.includes(selectedNode.id))
        return orderedSelectedIds;
      return [selectedNode.id];
    }
    return orderedSelectedIds;
  }, [orderedSelectedIds, selectedNode]);

  const extractSubgraphs = useCallback(
    (targetNodeIds: string[]) => {
      try {
        const { nodes: currentNodes, edges: currentEdges } =
          useReactFlowExtStore.getState();

        const nodeMap = new Map(currentNodes.map((n) => [n.id, n]));
        const comprehensiveIdsArray = getComprehensiveSelection(
          targetNodeIds,
          currentNodes,
          currentEdges,
        );
        const nodeIdsToExtract = new Set(comprehensiveIdsArray);

        // Include modelNodes that belong to any aiNode being extracted.
        // parentId is the primary link between modelNode and aiNode.
        comprehensiveIdsArray.forEach((id) => {
          if (nodeMap.get(id)?.type === "aiNode") {
            currentNodes.forEach((n) => {
              if (n.type === "modelNode" && n.parentId === id)
                nodeIdsToExtract.add(n.id);
            });
          }
        });

        const sortedRoots = [...nodeIdsToExtract]
          .filter((id) => {
            const node = nodeMap.get(id);
            // modelNode is never a subgraph root — it travels with its aiNode
            if (node?.type === "modelNode") return false;

            return ![...nodeIdsToExtract].some((parentId) => {
              if (parentId === id) return false;
              const parentNode = nodeMap.get(parentId);
              const currentNode = nodeMap.get(id);

              if (
                parentNode?.data?.groupId &&
                parentNode.data.groupId === currentNode?.data?.groupId
              )
                return parentNode.data.isGroupHead;

              if (parentNode?.data?.mergeBranchesNodeId) {
                if (
                  parentNode.type === "conditionalNode" ||
                  parentNode.type === "forLoopNode"
                )
                  return getIntermediateNodeIds(
                    currentNodes,
                    currentEdges,
                    parentId,
                  ).includes(id);

                if (parentNode.type === "branchNode1")
                  return getBranchSubgraphNodeIds(
                    currentNodes,
                    currentEdges,
                    parentId,
                    parentNode.data.mergeBranchesNodeId as string,
                  ).includes(id);
              }

              return false;
            });
          })
          .sort((a, b) => {
            const na = nodeMap.get(a);
            const nb = nodeMap.get(b);
            return (na?.position.x || 0) - (nb?.position.x || 0);
          });

        const orderedSubgraphs = sortedRoots.map((id) => {
          const node = nodeMap.get(id);
          let exitId = id;

          if (node?.data?.groupId && node?.data?.isGroupHead) {
            const groupId = node.data.groupId;
            const groupNodes = currentNodes.filter(
              (n) => n.data?.groupId === groupId,
            );
            const groupNodeIds = new Set(groupNodes.map((n) => n.id));
            const groupLastNode = groupNodes.find(
              (gn) =>
                !currentEdges.some(
                  (e) =>
                    e.source === gn.id &&
                    groupNodeIds.has(e.target) &&
                    !e.data?.isTemporary,
                ),
            );
            if (groupLastNode) exitId = groupLastNode.id;
          } else if (
            node?.type === "conditionalNode" ||
            node?.type === "forLoopNode"
          ) {
            exitId = (node.data?.mergeBranchesNodeId as string) || id;
          } else if (node?.type === "branchNode1") {
            const mergeId = node.data?.mergeBranchesNodeId as string;
            if (mergeId) {
              const branchIds = getBranchSubgraphNodeIds(
                currentNodes,
                currentEdges,
                id,
                mergeId,
              );
              const exitEdge = currentEdges.find(
                (e) => branchIds.includes(e.source) && e.target === mergeId,
              );
              exitId = exitEdge
                ? exitEdge.source
                : branchIds[branchIds.length - 1] || id;
            }
          }

          return { entryId: id, exitId, rootId: id };
        });

        const extractedNodes = currentNodes
          .filter((n) => nodeIdsToExtract.has(n.id))
          .map((node) => {
            const data = { ...node.data, isCut: false } as NodeDataType;

            if (data.groupId) {
              const isHeadExtracted = currentNodes.some(
                (n) =>
                  n.data?.groupId === data.groupId &&
                  n.data?.isGroupHead &&
                  nodeIdsToExtract.has(n.id),
              );
              if (isHeadExtracted) {
                data.clipboardGroupId = data.groupId as string;
                if (data.isGroupHead) data.clipboardGroupHead = true;
              }
              delete data.groupId;
              delete data.isGroupHead;
              delete data.isExpanded;
              delete data.count;
              delete data.isBlock;
            }

            return {
              ...node,
              hidden: false,
              // modelNode must keep parentId — it's the link to its aiNode
              parentId: node.type === "modelNode" ? node.parentId : undefined,
              data,
            };
          });

        // extractedEdges naturally includes the aiNode↔modelNode edge since
        // both endpoints are in nodeIdsToExtract
        let extractedEdges = currentEdges.filter(
          (e) =>
            !e.data?.isTemporary &&
            nodeIdsToExtract.has(e.source) &&
            nodeIdsToExtract.has(e.target),
        );

        for (let i = 0; i < orderedSubgraphs.length - 1; i++) {
          const currentExit = orderedSubgraphs[i].exitId;
          const nextEntry = orderedSubgraphs[i + 1].entryId;
          if (
            !extractedEdges.some(
              (e) => e.source === currentExit && e.target === nextEntry,
            )
          )
            extractedEdges.push(createPlusEdgeObj(currentExit, nextEntry));
        }

        extractedEdges = deduplicateEdges(extractedEdges);

        return {
          extractedNodes,
          extractedEdges,
          originalEntryId:
            orderedSubgraphs.length > 0 ? orderedSubgraphs[0].entryId : "",
          originalExitId:
            orderedSubgraphs.length > 0
              ? orderedSubgraphs[orderedSubgraphs.length - 1].exitId
              : "",
        };
      } catch (error) {
        console.error("Subgraph extraction failed:", error);
        return null;
      }
    },
    [orderedSelectedIds, getComprehensiveSelection],
  );

  const copyNodes = useCallback(() => {
    const targetIds = getTargetIds();
    if (targetIds.length === 0) return;
    cancelCut();

    const result = extractSubgraphs(targetIds);
    if (result && result.extractedNodes.length) {
      setClipboard({
        nodes: result.extractedNodes,
        edges: result.extractedEdges,
        operation: "copy",
        originalEntryId: result.originalEntryId,
        originalExitId: result.originalExitId,
      });
      toast.success(`Copied successfully.`);
      resetContextMenu();
    } else {
      toast.error("Failed to copy nodes.");
    }
  }, [
    getTargetIds,
    cancelCut,
    extractSubgraphs,
    setClipboard,
    resetContextMenu,
  ]);

  const cutNodes = useCallback(() => {
    const targetIds = getTargetIds();
    if (targetIds.length === 0) return;

    const { nodes: currentNodes } = useReactFlowExtStore.getState();

    const targetBranchHeads = currentNodes.filter(
      (n) => targetIds.includes(n.id) && n.type === "branchNode1",
    );
    for (const targetBranchHead of targetBranchHeads) {
      const parentNode = currentNodes.find(
        (n) =>
          n.type === "conditionalNode" &&
          n.data?.mergeBranchesNodeId ===
            targetBranchHead.data?.mergeBranchesNodeId,
      );
      const isRouterSelected = parentNode && targetIds.includes(parentNode.id);
      if (!isRouterSelected && parentNode) {
        const branches = (parentNode.data?.branches ?? []) as string[];
        if (branches.length <= 2) {
          toast.info("At least two branches are required. Cannot cut.");
          return;
        }
      }
    }

    const result = extractSubgraphs(targetIds);
    if (result && result.extractedNodes.length) {
      setClipboard({
        nodes: result.extractedNodes,
        edges: result.extractedEdges,
        operation: "cut",
        originalEntryId: result.originalEntryId,
        originalExitId: result.originalExitId,
      });
      const extractedIds = new Set(result.extractedNodes.map((n) => n.id));
      currentNodes.forEach((node) => {
        if (extractedIds.has(node.id)) updateNodeData(node.id, { isCut: true });
      });
    }
    resetContextMenu();
  }, [
    extractSubgraphs,
    getTargetIds,
    resetContextMenu,
    setClipboard,
    updateNodeData,
  ]);

  const pasteNodes = useCallback(
    (
      targetNodeId: string,
      position: "before" | "after" | "branch" | "branch-above" | "branch-below",
    ) => {
      const clipboard = useClipboardStore.getState().clipboard;
      if (!clipboard || !clipboard.nodes.length) return;
      if (
        clipboard.operation === "cut" &&
        clipboard.nodes.some((n) => n.id === targetNodeId)
      ) {
        toast.warning("Please choose a different node to paste.");
        return;
      }

      const {
        nodes: currentNodes,
        edges: currentEdges,
        flowVariablesObject: currentVariables,
      } = useReactFlowExtStore.getState();
      const targetNode = currentNodes.find((n) => n.id === targetNodeId);
      if (!targetNode) return;

      const isTargetGroupHead = targetNode.data?.isGroupHead === true;
      const targetGroupId =
        targetNode.data?.groupId && !isTargetGroupHead
          ? (targetNode.data.groupId as string)
          : undefined;

      let newNodes: Node[];
      let newEdges: Edge[];
      let entryNodeId: string;
      let exitNodeId: string;
      let idMap = new Map<string, string>();

      if (clipboard.operation === "copy") {
        const generated = generatePastedSubgraph(
          clipboard.nodes,
          clipboard.edges,
          clipboard.originalEntryId,
          clipboard.originalExitId,
        );
        newEdges = generated.newEdges;
        entryNodeId = generated.entryNodeId;
        exitNodeId = generated.exitNodeId;
        idMap = generated.idMap;
        newNodes = generated.newNodes;

        // Remap modelNode parentId and data.description to the new aiNode id.
        // generatePastedSubgraph assigns new IDs to all nodes via idMap but
        // doesn't know about the aiNode→modelNode parentId relationship.
        newNodes = newNodes.map((n) => {
          if (n.type !== "modelNode" || !n.parentId) return n;
          const newParentId = idMap.get(n.parentId);
          if (!newParentId) return n;
          return {
            ...n,
            parentId: newParentId,
            data: { ...n.data, description: newParentId },
          };
        });
      } else {
        // cut: IDs are unchanged, parentId relationships are already intact
        newNodes = clipboard.nodes;
        newEdges = clipboard.edges;
        entryNodeId = clipboard.originalEntryId;
        exitNodeId = clipboard.originalExitId;
      }

      if (targetGroupId) {
        newNodes = newNodes.map((n) => {
          const newData = { ...n.data };
          delete newData.clipboardGroupId;
          delete newData.clipboardGroupHead;
          newData.groupId = targetGroupId;
          newData.isGroupHead = false;
          delete newData.isExpanded;
          delete newData.count;
          delete newData.hasBlock;
          return { ...n, hidden: false, data: newData };
        });
      } else {
        const groupsToRecreate = new Map<string, Node[]>();
        newNodes.forEach((n) => {
          if (!n.data?.clipboardGroupId) return;
          const cGid = n.data.clipboardGroupId as string;
          if (!groupsToRecreate.has(cGid)) groupsToRecreate.set(cGid, []);
          groupsToRecreate.get(cGid)!.push(n);
        });

        groupsToRecreate.forEach((members, oldGroupId) => {
          const hasOriginalHead = members.some(
            (m) => m.data.clipboardGroupHead,
          );
          if (hasOriginalHead) {
            const newGroupId =
              clipboard.operation === "copy"
                ? `group-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
                : oldGroupId;
            const groupHead =
              members.find((m) => m.data.clipboardGroupHead) || members[0];
            const hasBlock = members.some((m) => m.type === "blockNode");
            members.forEach((m) => {
              m.data.groupId = newGroupId;
              delete m.data.clipboardGroupId;
              delete m.data.clipboardGroupHead;
              if (m.id === groupHead.id) {
                m.data.isGroupHead = true;
                m.data.isExpanded = false;
                m.data.count = members.length;
                m.data.hasBlock = hasBlock;
                m.hidden = false;
              } else {
                m.hidden = true;
              }
            });
          } else {
            members.forEach((m) => {
              delete m.data.clipboardGroupId;
              delete m.data.clipboardGroupHead;
            });
          }
        });
      }

      let nextEdges = [...currentEdges];
      let nextNodes = [...currentNodes];
      let nextFlowVariables = [...currentVariables];

      if (targetGroupId) {
        const headIndex = nextNodes.findIndex(
          (n) => n.data?.groupId === targetGroupId && n.data?.isGroupHead,
        );
        if (headIndex !== -1) {
          const currentCount = (nextNodes[headIndex].data.count as number) || 1;
          nextNodes[headIndex] = {
            ...nextNodes[headIndex],
            data: {
              ...nextNodes[headIndex].data,
              isExpanded: true,
              count: currentCount + newNodes.length,
            },
          };
          nextNodes = nextNodes.map((n) =>
            n.data?.groupId === targetGroupId && !n.data?.isGroupHead
              ? { ...n, hidden: false }
              : n,
          );
        }
      }

      if (clipboard.operation === "copy" && currentVariables.length > 0) {
        const variablesToClone = currentVariables.filter((v) =>
          clipboard.nodes.some((n) => n.id === v.nodeId),
        );
        variablesToClone.forEach((v) => {
          const newMappedId = idMap.get(v.nodeId);
          if (newMappedId)
            nextFlowVariables.push({ ...v, nodeId: newMappedId });
        });
        setFlowVariablesObject(nextFlowVariables ?? []);
      }

      if (clipboard.operation === "cut") {
        const oldNodeIds = new Set(clipboard.nodes.map((n) => n.id));

        // Adjust group head counts for members being moved out
        const groupsAffected = new Map<string, number>();
        clipboard.nodes.forEach((n) => {
          if (!n.data?.clipboardGroupId || n.data.clipboardGroupHead) return;
          const isHeadMoved = clipboard.nodes.some(
            (cn) =>
              cn.data?.clipboardGroupId === n.data?.clipboardGroupId &&
              cn.data?.clipboardGroupHead,
          );
          if (!isHeadMoved)
            groupsAffected.set(
              n.data.clipboardGroupId as string,
              (groupsAffected.get(n.data.clipboardGroupId as string) || 0) + 1,
            );
        });
        groupsAffected.forEach((removedCount, gId) => {
          const idx = nextNodes.findIndex(
            (n) => n.data?.groupId === gId && n.data?.isGroupHead,
          );
          if (idx === -1) return;
          const currentCount = (nextNodes[idx].data.count as number) || 1;
          nextNodes[idx] = {
            ...nextNodes[idx],
            data: {
              ...nextNodes[idx].data,
              count: Math.max(1, currentCount - removedCount),
            },
          };
        });

        nextEdges = nextEdges.filter((e) => !e.data?.isTemporary);

        const nodesToRemove = nextNodes.filter((n) => oldNodeIds.has(n.id));
        const result = runSequentialDeletion(
          nextNodes,
          nextEdges,
          nextFlowVariables,
          nodesToRemove,
        );
        nextNodes = result.nodes;
        nextEdges = result.edges;
        nextFlowVariables = result.flowVariables as typeof nextFlowVariables;

        flowEventChannel.postMessage({
          type: "CUT_NODES_PASTED",
          payload: { nodes: clipboard.nodes },
        });
        clearClipboard();
      }

      nextEdges = nextEdges.filter((e) => !e.data?.isTemporary);

      if (position === "before") {
        const incomingEdgeIndex = nextEdges.findIndex(
          (e) =>
            e.target === targetNodeId &&
            e.targetHandle !== "for-loop-repeat" &&
            e.type !== "loopBack",
        );
        if (incomingEdgeIndex !== -1) {
          const originalEdge = nextEdges[incomingEdgeIndex];
          nextEdges[incomingEdgeIndex] = {
            ...originalEdge,
            target: entryNodeId,
          };
          nextEdges.splice(
            incomingEdgeIndex + 1,
            0,
            ...newEdges,
            cloneEdgeObj(originalEdge, exitNodeId, targetNodeId),
          );
        } else {
          nextEdges.push(
            ...newEdges,
            createPlusEdgeObj(exitNodeId, targetNodeId),
          );
        }
        const targetIndex = nextNodes.findIndex((n) => n.id === targetNodeId);
        if (targetIndex !== -1) {
          nextNodes.splice(targetIndex, 0, ...newNodes);
        } else {
          nextNodes.push(...newNodes);
        }
      } else if (position === "after") {
        let effectiveTargetId = targetNodeId;

        if (
          targetNode.type === "conditionalNode" ||
          targetNode.type === "forLoopNode"
        ) {
          if (targetNode.data?.mergeBranchesNodeId)
            effectiveTargetId = targetNode.data.mergeBranchesNodeId as string;
        } else if (isTargetGroupHead) {
          const groupId = targetNode.data!.groupId as string;
          const groupNodes = nextNodes.filter(
            (n) => n.data?.groupId === groupId,
          );
          const groupNodeIds = new Set(groupNodes.map((n) => n.id));
          const groupLastNode = groupNodes.find(
            (gn) =>
              !nextEdges.some(
                (e) => e.source === gn.id && groupNodeIds.has(e.target),
              ),
          );
          if (groupLastNode) effectiveTargetId = groupLastNode.id;
        }

        const outgoingEdgeIndex = nextEdges.findIndex(
          (e) =>
            e.source === effectiveTargetId &&
            e.sourceHandle !== "branch-return" &&
            e.type !== "loopBack",
        );
        if (outgoingEdgeIndex !== -1) {
          const originalEdge = nextEdges[outgoingEdgeIndex];
          nextEdges[outgoingEdgeIndex] = {
            ...originalEdge,
            source: exitNodeId,
          };
          nextEdges.splice(
            outgoingEdgeIndex,
            0,
            cloneEdgeObj(originalEdge, effectiveTargetId, entryNodeId),
            ...newEdges,
          );
        } else {
          nextEdges.push(
            createPlusEdgeObj(effectiveTargetId, entryNodeId),
            ...newEdges,
          );
        }
        const targetIndex = nextNodes.findIndex(
          (n) => n.id === effectiveTargetId,
        );
        if (targetIndex !== -1) {
          nextNodes.splice(targetIndex + 1, 0, ...newNodes);
        } else {
          nextNodes.push(...newNodes);
        }
      } else if (
        position === "branch" ||
        position === "branch-above" ||
        position === "branch-below"
      ) {
        const parentNodeIndex = nextNodes.findIndex(
          (n) =>
            n.type === "conditionalNode" &&
            n.data?.mergeBranchesNodeId ===
              targetNode.data?.mergeBranchesNodeId,
        );

        if (parentNodeIndex !== -1) {
          const parentNode = nextNodes[parentNodeIndex];
          const branches = [...((parentNode.data?.branches as string[]) || [])];
          const mergeNodeId = parentNode.data?.mergeBranchesNodeId as string;

          let resolvedBranchHeadId = targetNodeId;
          if (mergeNodeId) {
            const foundBranch = branches.find(
              (bId) =>
                bId === targetNodeId ||
                getBranchSubgraphNodeIds(
                  currentNodes,
                  currentEdges,
                  bId,
                  mergeNodeId,
                ).includes(targetNodeId),
            );
            if (foundBranch) resolvedBranchHeadId = foundBranch;
          }

          const pastedBranchHead = newNodes.find((n) => n.id === entryNodeId);
          if (pastedBranchHead?.data) {
            pastedBranchHead.data = {
              ...pastedBranchHead.data,
              label:
                clipboard.operation === "copy" && pastedBranchHead.data.label
                  ? `${pastedBranchHead.data.label} copy`
                  : pastedBranchHead.data.label || "Branch",
              title:
                clipboard.operation === "copy" && pastedBranchHead.data.title
                  ? `${pastedBranchHead.data.title} copy`
                  : pastedBranchHead.data.title || "Branch",
            };
          }

          const targetIndex = branches.indexOf(resolvedBranchHeadId);
          const insertIndex =
            position === "branch-above" && targetIndex !== -1
              ? targetIndex
              : targetIndex !== -1
                ? targetIndex + 1
                : branches.length;

          branches.splice(insertIndex, 0, entryNodeId);
          nextNodes[parentNodeIndex] = {
            ...parentNode,
            data: { ...parentNode.data, branches },
          };

          const nextBranchId = branches[insertIndex + 1];

          const conditionalEdge = nextEdges.find(
            (e) =>
              e.source === parentNode.id && e.target === resolvedBranchHeadId,
          );
          const branchEntryEdge = conditionalEdge
            ? cloneEdgeObj(conditionalEdge, parentNode.id, entryNodeId)
            : createCustomEdgeObj(parentNode.id, entryNodeId);

          const referenceExitEdge = nextEdges.find(
            (e) => e.target === mergeNodeId && e.source !== exitNodeId,
          );
          const branchExitEdge = referenceExitEdge
            ? cloneEdgeObj(referenceExitEdge, exitNodeId, mergeNodeId)
            : createCustomEdgeObj(exitNodeId, mergeNodeId);

          // Node insertion point: before nextBranch, or before mergeNode, or at end
          const masterNodeInsertIndex =
            (nextBranchId
              ? nextNodes.findIndex((n) => n.id === nextBranchId)
              : -1) !== -1
              ? nextNodes.findIndex((n) => n.id === nextBranchId)
              : mergeNodeId
                ? nextNodes.findIndex((n) => n.id === mergeNodeId)
                : nextNodes.length;

          nextNodes.splice(
            masterNodeInsertIndex === -1
              ? nextNodes.length
              : masterNodeInsertIndex,
            0,
            ...newNodes,
          );

          // Edge insertion point: before nextBranch's entry edge, or before mergeNode edges, or at end
          const masterEdgeInsertIndex = nextBranchId
            ? nextEdges.findIndex(
                (e) => e.source === parentNode.id && e.target === nextBranchId,
              )
            : mergeNodeId
              ? nextEdges.findIndex((e) => e.target === mergeNodeId)
              : -1;

          nextEdges.splice(
            masterEdgeInsertIndex === -1
              ? nextEdges.length
              : masterEdgeInsertIndex,
            0,
            branchEntryEdge,
            ...newEdges,
            branchExitEdge,
          );
        }
      }

      nextEdges = rebuildBypassEdges(nextNodes, nextEdges);
      nextEdges = deduplicateEdges(nextEdges);

      setNodes(nextNodes);
      setEdges(nextEdges);
      if (clipboard.operation === "cut")
        setFlowVariablesObject(nextFlowVariables ?? []);
      autoLayout({ newNodes: nextNodes, newEdges: nextEdges });
      resetContextMenu();
    },
    [autoLayout, clearClipboard, resetContextMenu, setFlowVariablesObject],
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      const {
        nodes: currentNodes,
        edges: currentEdges,
        flowVariablesObject: currentVariables,
      } = useReactFlowExtStore.getState();

      const comprehensiveIds = getComprehensiveSelection(
        [nodeId],
        currentNodes,
        currentEdges,
      );
      const nodesToDelete = currentNodes.filter((n) =>
        comprehensiveIds.includes(n.id),
      );
      const primaryNode = currentNodes.find((n) => n.id === nodeId);

      if (primaryNode?.type === "branchNode1") {
        const parentNode = currentNodes.find(
          (n) =>
            n.type === "conditionalNode" &&
            n.data?.mergeBranchesNodeId ===
              primaryNode.data?.mergeBranchesNodeId,
        );
        const isRouterSelected =
          parentNode && nodesToDelete.some((n) => n.id === parentNode.id);
        if (parentNode && !isRouterSelected) {
          const branches = (parentNode.data?.branches ?? []) as string[];
          if (branches.length <= 2) {
            toast.info("At least two branches are required.");
            return;
          }
        }
      }

      const performDelete = () => {
        const result = runSequentialDeletion(
          [...currentNodes],
          currentEdges.filter((e) => !e.data?.isTemporary),
          [...currentVariables],
          nodesToDelete,
        );

        // Adjust group head counts for any non-head group members being deleted
        const updatedNodes = result.nodes;
        const groupsAffected = new Map<string, number>();
        nodesToDelete.forEach((n) => {
          if (!n.data?.groupId || n.data.isGroupHead) return;
          const isHeadDeleted = nodesToDelete.some(
            (cn) =>
              cn.data?.groupId === n.data?.groupId && cn.data?.isGroupHead,
          );
          if (!isHeadDeleted)
            groupsAffected.set(
              n.data.groupId as string,
              (groupsAffected.get(n.data.groupId as string) || 0) + 1,
            );
        });
        groupsAffected.forEach((removedCount, gId) => {
          const idx = updatedNodes.findIndex(
            (n) => n.data?.groupId === gId && n.data?.isGroupHead,
          );
          if (idx === -1) return;
          const currentCount = (updatedNodes[idx].data.count as number) || 1;
          updatedNodes[idx] = {
            ...updatedNodes[idx],
            data: {
              ...updatedNodes[idx].data,
              count: Math.max(1, currentCount - removedCount),
            },
          };
        });

        let updatedEdges = rebuildBypassEdges(updatedNodes, result.edges);
        updatedEdges = deduplicateEdges(updatedEdges);

        setFlowVariablesObject(result?.flowVariables ?? []);
        autoLayout({ newNodes: updatedNodes, newEdges: updatedEdges });
      };

      if (deleteAlert) {
        showDefaultAlertDialog({
          alertType: "delete",
          confirmActionFn: performDelete,
        });
      } else {
        performDelete();
      }
      resetContextMenu();
    },
    [
      autoLayout,
      deleteAlert,
      resetContextMenu,
      setFlowVariablesObject,
      showDefaultAlertDialog,
      getComprehensiveSelection,
    ],
  );

  const disableNode = useCallback(
    (isDisabled: boolean) => {
      if (!selectedNode) return;

      const { nodes: currentNodes, edges: currentEdges } =
        useReactFlowExtStore.getState();

      const comprehensiveIds = getComprehensiveSelection(
        [selectedNode.id],
        currentNodes,
        currentEdges,
      );
      currentNodes
        .filter((n) => comprehensiveIds.includes(n.id))
        .forEach((n) => updateNodeData(n.id, { isDisabled }));
      resetContextMenu();
    },
    [selectedNode, updateNodeData, resetContextMenu, getComprehensiveSelection],
  );

  return {
    copyNodes,
    cutNodes,
    pasteNodes,
    deleteNode,
    disableNode,
    cancelCut,
    nodes,
  };
};
