import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { Edge, Node } from "@xyflow/react";
import { useCallback } from "react";
import { createPlusEdgeObj } from "@/utils/create-edges/create-plus-edge-obj";
import { useDagreAutoLayout } from "@/hooks/useDagreAutoLayout";
import { getNodesAndEdgesAfterDeletion } from "../utils/getNodesAndEdgesAfterDeletion";
import { toast } from "@aventisia/ui/sonner";
import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";
import { useShallow } from "zustand/react/shallow";
import { useContextMenuActionsStore } from "@/stores/context-menu-actions-store";
import { getIntermediateNodeIds } from "../utils/getIntermediateNodes";
import { getBranchSubgraphNodeIds } from "../utils/getBranchSubNodeIds";
import { generatePastedSubgraph } from "../utils/clipboardUtils";
import { useClipboardStore } from "../stores/useClipboardStore";
import { createCustomEdgeObj } from "@/utils/create-edges/create-custom-edge-obj";
import { useOrderedSelection } from "./useOrderedSelection";
import { NodeDataType } from "@/types/node-data-type";

/* Hook to perform cut copy paste and delete operations on nodes */
export const useFlowOperations = () => {
  const {
    nodes,
    edges,
    flowVariablesObject,
    setFlowVariablesObject,
    setNodes,
    setEdges,
  } = useReactFlowExtStore();

  const { selectedNode } = useContextMenuActionsStore(
    useShallow((state) => ({ selectedNode: state.selectedNode })),
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

  const clearCutStyles = useCallback(() => {
    if (!nodes.some((n) => n.data?.isCut === true)) return;
    setNodes(
      nodes.map((node) => {
        if (node.data && node.data.isCut === true) {
          return { ...node, data: { ...node.data, isCut: false } };
        }
        return node;
      }),
    );
  }, [nodes, setNodes]);

  const cancelCut = useCallback(() => {
    clearCutStyles();
    clearClipboard();
  }, [clearCutStyles, clearClipboard]);

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
        const nodeIdsToExtract = new Set<string>();
        const nodeToRootMap = new Map<string, string>();

        const rootTargetIds = targetNodeIds.filter((id) => {
          return !targetNodeIds.some((parentCandidateId) => {
            if (parentCandidateId === id) return false;
            const parentNode = nodes.find((n) => n.id === parentCandidateId);
            if (
              parentNode?.type === "conditionalNode" ||
              parentNode?.type === "forLoopNode"
            ) {
              if (parentNode.data?.mergeBranchesNodeId)
                return getIntermediateNodeIds(
                  nodes,
                  edges,
                  parentCandidateId,
                ).includes(id);
            }
            if (parentNode?.type === "branchNode1") {
              const mergeId = parentNode.data?.mergeBranchesNodeId as string;
              if (mergeId)
                return getBranchSubgraphNodeIds(
                  nodes,
                  edges,
                  parentCandidateId,
                  mergeId,
                ).includes(id);
            }
            return false;
          });
        });

        const sortedRoots = [...rootTargetIds].sort((a, b) => {
          const indexA = orderedSelectedIds.indexOf(a);
          const indexB = orderedSelectedIds.indexOf(b);

          if (indexA === -1 && indexB === -1) {
            const na = nodes.find((n) => n.id === a);
            const nb = nodes.find((n) => n.id === b);
            return Math.round((na?.position.y || 0) - (nb?.position.y || 0));
          }
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        const orderedSubgraphs = sortedRoots.map((id) => {
          const node = nodes.find((n) => n.id === id);
          let exitId = id;

          if (
            node?.type === "conditionalNode" ||
            node?.type === "forLoopNode"
          ) {
            exitId = (node.data?.mergeBranchesNodeId as string) || id;
          } else if (node?.type === "branchNode1") {
            const mergeId = node.data?.mergeBranchesNodeId as string;
            if (mergeId) {
              const branchIds = getBranchSubgraphNodeIds(
                nodes,
                edges,
                id,
                mergeId,
              );
              const exitEdge = edges.find(
                (e) => branchIds.includes(e.source) && e.target === mergeId,
              );
              exitId = exitEdge
                ? exitEdge.source
                : branchIds[branchIds.length - 1] || id;
            }
          }
          return { entryId: id, exitId, rootId: id };
        });

        sortedRoots.forEach((rootId) => {
          const node = nodes.find((n) => n.id === rootId);
          if (!node) return;

          nodeIdsToExtract.add(rootId);
          nodeToRootMap.set(rootId, rootId);

          if (node.type === "conditionalNode" || node.type === "forLoopNode") {
            if (node.data?.mergeBranchesNodeId) {
              getIntermediateNodeIds(nodes, edges, node.id).forEach((id) => {
                nodeIdsToExtract.add(id);
                nodeToRootMap.set(id, rootId);
              });
            }
          } else if (node.type === "branchNode1") {
            const mergeNodeId = node.data?.mergeBranchesNodeId as string;
            if (mergeNodeId) {
              getBranchSubgraphNodeIds(
                nodes,
                edges,
                node.id,
                mergeNodeId,
              ).forEach((id) => {
                nodeIdsToExtract.add(id);
                nodeToRootMap.set(id, rootId);
              });
            }
          }
        });

        const extractedNodes = nodes
          .map((node) => {
            if (node.data && node.data.isCut === true) {
              return { ...node, data: { ...node.data, isCut: false } };
            }
            return node;
          })
          .filter((n) => nodeIdsToExtract.has(n.id));

        const extractedEdges = edges.filter((e) => {
          const sourceRoot = nodeToRootMap.get(e.source);
          const targetRoot = nodeToRootMap.get(e.target);
          return sourceRoot && targetRoot && sourceRoot === targetRoot;
        });

        for (let i = 0; i < orderedSubgraphs.length - 1; i++) {
          const currentExit = orderedSubgraphs[i].exitId;
          const nextEntry = orderedSubgraphs[i + 1].entryId;
          extractedEdges.push(createPlusEdgeObj(currentExit, nextEntry));
        }

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
    [nodes, edges, orderedSelectedIds],
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
      toast.success(`Copied`);
    } else {
      toast.error("Failed to copy nodes.");
    }
  }, [getTargetIds, extractSubgraphs, setClipboard, clearCutStyles, cancelCut]);

  const cutNodes = useCallback(() => {
    const targetIds = getTargetIds();
    if (targetIds.length === 0) return;

    const targetBranchHead = nodes.find(
      (n) => targetIds.includes(n.id) && n.type === "branchNode1",
    );
    if (targetBranchHead) {
      const parentNode = nodes.find(
        (n) =>
          n.type === "conditionalNode" &&
          n.data?.mergeBranchesNodeId ===
            targetBranchHead.data?.mergeBranchesNodeId,
      );
      const branches = (parentNode?.data?.branches ?? []) as string[];
      if (branches.length <= 2) {
        toast.info("At least two branches are required. Cannot cut.");
        return;
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

      setNodes(
        nodes.map((node) =>
          result.extractedNodes.some((en) => en.id === node.id)
            ? {
                ...node,
                data: { ...node.data, isCut: true },
              }
            : node,
        ),
      );
    }
  }, [getTargetIds, extractSubgraphs, setNodes, setClipboard, nodes]);

  const pasteNodes = useCallback(
    (
      targetNodeId: string,
      position: "above" | "below" | "branch" | "branch-before" | "branch-after",
    ) => {
      const clipboard = useClipboardStore.getState().clipboard;
      if (!clipboard || !clipboard.nodes.length) return;
      if (
        clipboard.operation == "cut" &&
        clipboard.nodes.map((node) => node.id).includes(targetNodeId)
      ) {
        toast.warning("Please choose a different node to paste.");
        return;
      }
      const targetNode = nodes.find((n) => n.id === targetNodeId);
      if (!targetNode) return;

      let newNodes: Node[];
      let newEdges: Edge[];
      let entryNodeId: string;
      let exitNodeId: string;
      let idMap = new Map<string, string>();

      // 1. Process Nodes based on Operation type (Copy vs Cut)
      if (clipboard.operation === "copy") {
        const generated = generatePastedSubgraph(
          clipboard.nodes,
          clipboard.edges,
          clipboard.originalEntryId,
          clipboard.originalExitId,
        );
        newNodes = generated.newNodes;
        newEdges = generated.newEdges;
        entryNodeId = generated.entryNodeId;
        exitNodeId = generated.exitNodeId;
        idMap = generated.idMap;
      } else {
        // CUT: Retain Original IDs (Move instead of Clone)
        const clipboardNodeIds = new Set(clipboard.nodes.map((n) => n.id));
        newNodes = clipboard.nodes.map((n) => {
          const newData = { ...n.data, isCut: false } as NodeDataType;
          // Eject from visual group if parent group isn't also moving
          if (
            newData?.groupId &&
            typeof newData?.groupId === "string" &&
            !clipboardNodeIds.has(newData.groupId)
          ) {
            delete newData.groupId;
          }
          return { ...n, data: newData };
        });
        newEdges = clipboard.edges;
        entryNodeId = clipboard.originalEntryId;
        exitNodeId = clipboard.originalExitId;
      }

      let nextEdges = [...edges];
      let nextNodes = [...nodes];
      const nextFlowVariables = [...flowVariablesObject];

      const cloneEdgeObj = (
        originalEdge: Edge,
        newSource: string,
        newTarget: string,
      ): Edge => {
        const { sourceHandle, targetHandle, ...rest } = originalEdge;
        console.log(sourceHandle, targetHandle);
        return {
          ...rest,
          id: window.crypto.randomUUID(),
          source: newSource,
          target: newTarget,
        };
      };

      // Only clone flow variables if it's a Copy operation. Cut retains exact IDs.
      if (clipboard.operation === "copy" && flowVariablesObject.length > 0) {
        const variablesToClone = flowVariablesObject.filter((v) =>
          clipboard.nodes.some((n) => n.id === v.nodeId),
        );
        variablesToClone.forEach((v) => {
          const newMappedId = idMap.get(v.nodeId);
          if (newMappedId)
            nextFlowVariables.push({
              ...v,
              nodeId: newMappedId,
            });
        });
        setFlowVariablesObject(nextFlowVariables);
      }

      // Graph Healing
      if (clipboard.operation === "cut") {
        const oldNodeIds = new Set(clipboard.nodes.map((n) => n.id));
        const incomingEdges = nextEdges.filter(
          (e) => !oldNodeIds.has(e.source) && oldNodeIds.has(e.target),
        );
        const outgoingEdges = nextEdges.filter(
          (e) => oldNodeIds.has(e.source) && !oldNodeIds.has(e.target),
        );

        clipboard.nodes.forEach((cutNode) => {
          if (cutNode.type === "branchNode1") {
            const parentNodeIndex = nextNodes.findIndex(
              (n) =>
                n.type === "conditionalNode" &&
                n.data?.mergeBranchesNodeId ===
                  cutNode.data?.mergeBranchesNodeId,
            );
            if (parentNodeIndex !== -1) {
              const parentNode = nextNodes[parentNodeIndex];
              const updatedBranches = (
                (parentNode.data?.branches || []) as string[]
              ).filter((bId) => bId !== cutNode.id);
              nextNodes[parentNodeIndex] = {
                ...parentNode,
                data: { ...parentNode.data, branches: updatedBranches },
              };
            }
          }
        });

        nextNodes = nextNodes.filter((n) => !oldNodeIds.has(n.id));
        nextEdges = nextEdges.filter(
          (e) => !oldNodeIds.has(e.source) && !oldNodeIds.has(e.target),
        );

        incomingEdges.forEach((inEdge) => {
          outgoingEdges.forEach((outEdge) => {
            const sourceNode = nextNodes.find((n) => n.id === inEdge.source);
            const targetNode = nextNodes.find((n) => n.id === outEdge.target);
            if (
              sourceNode?.type === "conditionalNode" &&
              targetNode?.id === sourceNode.data?.mergeBranchesNodeId
            ) {
              return;
            }
            nextEdges.push(createPlusEdgeObj(inEdge.source, outEdge.target));
          });
        });

        // Crucial: Clear clipboard immediately so the user can't duplicate the same exact IDs twice
        clearClipboard();
      }

      if (position === "above") {
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
          const connectingEdge = cloneEdgeObj(
            originalEdge,
            exitNodeId,
            targetNodeId,
          );
          nextEdges.splice(
            incomingEdgeIndex + 1,
            0,
            ...newEdges,
            connectingEdge,
          );
        } else {
          nextEdges.push(
            ...newEdges,
            createPlusEdgeObj(exitNodeId, targetNodeId),
          );
        }

        const targetIndex = nextNodes.findIndex((n) => n.id === targetNodeId);
        if (targetIndex !== -1) nextNodes.splice(targetIndex, 0, ...newNodes);
        else nextNodes.push(...newNodes);
      } else if (position === "below") {
        let effectiveTargetId = targetNodeId;

        if (
          targetNode.type === "conditionalNode" ||
          targetNode.type === "forLoopNode"
        ) {
          if (targetNode.data?.mergeBranchesNodeId)
            effectiveTargetId = targetNode.data.mergeBranchesNodeId as string;
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
          const connectingEdge = cloneEdgeObj(
            originalEdge,
            effectiveTargetId,
            entryNodeId,
          );
          nextEdges.splice(outgoingEdgeIndex, 0, connectingEdge, ...newEdges);
        } else {
          nextEdges.push(
            createPlusEdgeObj(effectiveTargetId, entryNodeId),
            ...newEdges,
          );
        }

        const targetIndex = nextNodes.findIndex(
          (n) => n.id === effectiveTargetId,
        );
        if (targetIndex !== -1)
          nextNodes.splice(targetIndex + 1, 0, ...newNodes);
        else nextNodes.push(...newNodes);
      } else if (
        position === "branch" ||
        position === "branch-before" ||
        position === "branch-after"
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
            const foundBranch = branches.find((bId) => {
              if (bId === targetNodeId) return true;
              return getBranchSubgraphNodeIds(
                nodes,
                edges,
                bId,
                mergeNodeId,
              ).includes(targetNodeId);
            });
            if (foundBranch) resolvedBranchHeadId = foundBranch;
          }

          const pastedBranchHead = newNodes.find((n) => n.id === entryNodeId);
          if (pastedBranchHead && pastedBranchHead.data) {
            pastedBranchHead.data = {
              ...pastedBranchHead.data,
              // Only apply 'copy' text if it was a Copy operation
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

          // Force default to branch-after
          const targetIndex = branches.indexOf(resolvedBranchHeadId);
          let insertIndex = branches.length;

          if (position === "branch-before" && targetIndex !== -1) {
            insertIndex = targetIndex;
          } else {
            // Default "branch" and "branch-after" both go AFTER the selected node
            insertIndex =
              targetIndex !== -1 ? targetIndex + 1 : branches.length;
          }

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

          const newEdgesBlock = [branchEntryEdge, ...newEdges, branchExitEdge];

          if (nextBranchId) {
            const nextBranchNodeIndex = nextNodes.findIndex(
              (n) => n.id === nextBranchId,
            );
            if (nextBranchNodeIndex !== -1) {
              nextNodes = [
                ...nextNodes.slice(0, nextBranchNodeIndex),
                ...newNodes,
                ...nextNodes.slice(nextBranchNodeIndex),
              ];
            } else {
              nextNodes = [...nextNodes, ...newNodes];
            }

            const nextBranchEdgeIndex = nextEdges.findIndex(
              (e) => e.source === parentNode.id && e.target === nextBranchId,
            );
            if (nextBranchEdgeIndex !== -1) {
              nextEdges = [
                ...nextEdges.slice(0, nextBranchEdgeIndex),
                ...newEdgesBlock,
                ...nextEdges.slice(nextBranchEdgeIndex),
              ];
            } else {
              nextEdges = [...nextEdges, ...newEdgesBlock];
            }
          } else {
            nextNodes = [...nextNodes, ...newNodes];
            nextEdges = [...nextEdges, ...newEdgesBlock];
          }
        }
      }

      setNodes(nextNodes);
      setEdges(nextEdges);
      autoLayout({ newNodes: nextNodes, newEdges: nextEdges });
    },
    [
      nodes,
      edges,
      flowVariablesObject,
      clearClipboard,
      setNodes,
      setEdges,
      setFlowVariablesObject,
      autoLayout,
    ],
  );

  // ... (deleteNode and disableNode unchanged below)
  const deleteNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const parentNode = nodes.find(
        (n) =>
          n.type === "conditionalNode" &&
          n.data?.mergeBranchesNodeId === node?.data?.mergeBranchesNodeId,
      );

      const branches: string[] = (parentNode?.data?.branches ?? []) as string[];

      if (branches.length <= 2 && node?.type == "branchNode1") {
        toast.info("At least two branches are required.");
        return;
      }

      const performDelete = () => {
        const { updatedNodes, updatedEdges, updatedFlowVariables } =
          getNodesAndEdgesAfterDeletion({
            node,
            nodes,
            edges,
            flowVariables: flowVariablesObject,
          });

        setNodes(updatedNodes);
        setEdges(updatedEdges);
        setFlowVariablesObject(updatedFlowVariables);
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
    },
    [
      nodes,
      edges,
      flowVariablesObject,
      showDefaultAlertDialog,
      autoLayout,
      deleteAlert,
      setNodes,
      setEdges,
      setFlowVariablesObject,
    ],
  );

  const disableNode = (isDisabled: boolean) => {
    if (!selectedNode) return;

    const selectedId = selectedNode?.id;
    const selectedData = selectedNode?.data || {};

    const isGroupHead = Boolean(selectedData?.isGroupHead);
    const groupId = selectedData?.groupId as string;
    const mergeBranchesNodeId = selectedData?.mergeBranchesNodeId;

    const intermediateNodeIds =
      mergeBranchesNodeId && selectedId
        ? getIntermediateNodeIds(nodes, edges, selectedId) || []
        : [];

    const updatedNodes = nodes.map((node: Node) => {
      const isSameNode = node?.id === selectedId;
      const isInSameGroup =
        isGroupHead && groupId && node?.data?.groupId === groupId;
      const isInMergeBranch =
        mergeBranchesNodeId && intermediateNodeIds.includes(node?.id);

      if (isSameNode || isInSameGroup || isInMergeBranch) {
        return { ...node, data: { ...node.data, isDisabled } };
      }
      return node;
    });

    setNodes(updatedNodes);
  };

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

