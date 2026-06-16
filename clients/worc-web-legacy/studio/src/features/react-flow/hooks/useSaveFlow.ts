import { FlowTypesEnum } from "@/react-toolkit/enums/flow-types-enum";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";

import { IHttpResponse } from "@aventisia/ui/dtos";
import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Node } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

import { updateFlowSilently } from "../apis/react-flow-apis";
import { LoadFlowDto } from "../dtos/load-flow-dto";
import { doesFlowContainAnyDesktopOnlyNode } from "../utils/has-desktop-nodes";

const TARGET_NODE_NAME = "CreateConversationAIAgent";
const INPUT_KEY = "__RecommendedActionsConfig__Conversation";

type RecommendActions = {
  defaultActions: string[];
  enableDynamicActions: boolean;
};

export const useSaveFlow = () => {
  // Get global store state & actions
  const { currentFlow, setIsFlowSaving } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      setIsFlowSaving: state.setIsFlowSaving,
    })),
  );

  const queryClient = useQueryClient();

  // Get ReactFlowExt store state & actions
  const {
    nodes,
    edges,
    isSavePending,
    flowVariablesObject,
    inputOutputObject,
    isPublished,
    viewport,
    flowType,
    setSavedSnapshot,
  } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      flowVariablesObject: state.flowVariablesObject,
      inputOutputObject: state.inputOutputObject,
      isSavePending: state.isSavePending,
      isPublished: state.isPublished,
      viewport: state.viewport,
      flowType: state.flowType,
      setSavedSnapshot: state.setSavedSnapshot,
    })),
  );

  // Create a mutation to update flow
  const { mutateAsync: updateFlow, isPending } = useMutation({
    mutationFn: updateFlowSilently,
    onSuccess: () => {
      // Capture the exact state that was persisted to the database
      setSavedSnapshot({
        nodes,
        edges,
        flowVariablesObject,
      });

      // Update the React Query cache so that returning to the flow editor
      // after navigating away re-hydrates from the latest saved state
      // instead of the stale initial fetch.
      queryClient.setQueryData(
        ["flow", currentFlow.id, currentFlow.versionId],
        (old: IHttpResponse<LoadFlowDto> | null | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              reactFlowObject: JSON.stringify({ nodes, edges, viewport }),
              flowVariablesObject: JSON.stringify(flowVariablesObject ?? []),
              inputOutputObject: JSON.stringify(inputOutputObject),
            },
          };
        },
      );

      queryClient.invalidateQueries({
        queryKey: ["AGENT_HISTORY", currentFlow.versionId],
      });

      toast.success("Flow saved successfully", {
        className: "sonner-toaster-sm",
      });
    },
    onError: (error) => {
      toast.error(error.toString());
    },
    onSettled: () => {
      setIsFlowSaving(false);
    },
  });

  // Function to perform save logic
  const saveData = async () => {
    if (currentFlow?.accessType === "View" && isSavePending) {
      toast.info("You are in View-only mode. Changes will not be saved.");
      return false;
    }

    if (isPublished && isSavePending) {
      toast.info("Changes will not be saved for published agent");
      return false;
    }

    // Check if save is pending
    if (!isSavePending || isPublished) return true;

    const defaultActions =
      (
        (
          nodes.find((node) => node.data?.name === TARGET_NODE_NAME)?.data as
            | NodeDataType
            | undefined
        )?.inputs?.find((input) => input.key === INPUT_KEY)?.value as
          | RecommendActions
          | undefined
      )?.defaultActions ?? [];

    // Create react flow object
    const reactFlowObject = {
      nodes,
      edges,
      viewport,
      ...(flowType === FlowTypesEnum.ChatAgent && {
        defaultActions,
      }),
    };

    const hasDesktopOnlyNode = doesFlowContainAnyDesktopOnlyNode(
      nodes as Node<NodeDataType>[],
    );

    // Set isFlowSaving to true
    setIsFlowSaving(true);

    await updateFlow({
      id: currentFlow.id,
      reactFlowObject: JSON.stringify(reactFlowObject),
      flowVariablesObject: JSON.stringify(flowVariablesObject ?? []),
      inputOutputObject: JSON.stringify(inputOutputObject),
      versionId: currentFlow.versionId,
      supportedPlatform: hasDesktopOnlyNode ? "windows" : "cloud",
    });

    return true;
  };
  return { saveData, isPending, isSavePending };
};
