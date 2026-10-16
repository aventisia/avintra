import { IHttpResponse } from "@avplatform/ui/dtos";
import { FlowTypesEnum } from "@avplatform/ui/enums";
import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edge, Node, Viewport } from "@xyflow/react";
import { useRef } from "react";

import type { DCPFieldSchemaType } from "@/features/dynamic-config-panel";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { FlowVariablesObjectType } from "@/types/flow-variables-object-type";
import { NodeDataType } from "@/types/node-data-type";
import { HistoryState, isHistoryEqual } from "@/utils/history-equality-checker";

import { updateFlowSilently } from "../apis/react-flow-apis";
import { LoadFlowDto } from "../dtos/load-flow-dto";
import { doesFlowContainAnyDesktopOnlyNode } from "../utils/has-desktop-nodes";
import {
  getVoiceAgentFirstSpeaker,
  getVoiceAgentIntroduction,
} from "../utils/voice-agent-graph.util";

const TARGET_NODE_NAME = "CreateConversationAIAgent";
const INPUT_KEY = "__RecommendedActionsConfig__Conversation";

type RecommendActions = {
  defaultActions: string[];
  enableDynamicActions: boolean;
};

// The exact payload persisted by the in-flight/last save. saveData() reads the
// freshest store state (so a config-form flush in the same tick is included);
// onSuccess baselines the dirty flag against this captured payload.
type PersistedBaseline = {
  /** Monotonic id so a stale onSuccess never baselines a newer save's payload. */
  sequence: number;
  snapshot: HistoryState;
  viewport: Viewport;
  inputOutputObject: DCPFieldSchemaType[];
  flowId: string;
  versionId: string;
};

/**
 * Derives whether the canvas differs from the last saved snapshot.
 *
 * IMPORTANT NOTE: useHistoryTracker refreshes isSavePending on a 300ms
 * debounce, so the flag can still be false in the same tick as a config-form
 * flush. Comparing synchronously against the saved snapshot lets a Save click
 * immediately after a flush persist the flushed edits.
 */
export const isCanvasDirty = (
  savedSnapshot: HistoryState | undefined | null,
  storePending: boolean,
  current: {
    nodes: Node[];
    edges: Edge[];
    flowVariablesObject: FlowVariablesObjectType[];
  },
): boolean => {
  if (storePending) return true;
  if (!savedSnapshot) return false;
  return !isHistoryEqual(savedSnapshot, current);
};

export const useSaveFlow = () => {
  const queryClient = useQueryClient();

  // Only the dirty flag drives re-renders (button enabled state).
  const isSavePending = useReactFlowExtStore((state) => state.isSavePending);

  const persistedRef = useRef<PersistedBaseline | null>(null);
  const saveSequenceRef = useRef(0);

  // Create a mutation to update flow
  const { mutateAsync: updateFlow, isPending } = useMutation({
    mutationFn: updateFlowSilently,
    onSuccess: () => {
      const persisted = persistedRef.current;
      // Skip when a newer save started after this one captured its payload —
      // that save's own onSuccess baselines the fresher snapshot.
      if (!persisted || persisted.sequence !== saveSequenceRef.current) return;

      // Capture the exact state that was persisted to the database
      useReactFlowExtStore.getState().setSavedSnapshot(persisted.snapshot);

      // Update the React Query cache so that returning to the flow editor
      // after navigating away re-hydrates from the latest saved state
      // instead of the stale initial fetch.
      queryClient.setQueryData(
        ["flow", persisted.flowId, persisted.versionId],
        (old: IHttpResponse<LoadFlowDto> | null | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              reactFlowObject: JSON.stringify({
                nodes: persisted.snapshot.nodes,
                edges: persisted.snapshot.edges,
                viewport: persisted.viewport,
              }),
              flowVariablesObject: JSON.stringify(persisted.snapshot.flowVariablesObject ?? []),
              inputOutputObject: JSON.stringify(persisted.inputOutputObject),
            },
          };
        },
      );

      queryClient.invalidateQueries({
        queryKey: ["AGENT_HISTORY", persisted.versionId],
      });

      toast.success("Flow saved successfully", {
        className: "sonner-toaster-sm",
      });
    },
    onError: (error) => {
      toast.error(error.toString());
    },
    onSettled: () => {
      useCurrentFlowStore.getState().setIsFlowSaving(false);
    },
  });

  // Function to perform save logic. Reads the store directly so callers that
  // flush config-form edits immediately before saving persist those edits.
  const saveData = async () => {
    const currentFlow = useCurrentFlowStore.getState().currentFlow;
    const {
      nodes,
      edges,
      isSavePending: storePending,
      flowVariablesObject,
      inputOutputObject,
      isPublished,
      viewport,
      flowType,
      savedSnapshot,
    } = useReactFlowExtStore.getState();

    const pending = isCanvasDirty(savedSnapshot, storePending, {
      nodes,
      edges,
      flowVariablesObject: flowVariablesObject ?? [],
    });

    if (currentFlow?.accessType === "View" && pending) {
      toast.info("You are in View-only mode. Changes will not be saved.");
      return false;
    }

    if (isPublished && pending) {
      toast.info("Changes will not be saved for published agent");
      return false;
    }

    // Check if save is pending
    if (!pending || isPublished) return true;

    const defaultActions =
      (
        (
          nodes.find((node) => node.data?.name === TARGET_NODE_NAME)?.data as
            NodeDataType | undefined
        )?.inputs?.find((input) => input.key === INPUT_KEY)?.value as RecommendActions | undefined
      )?.defaultActions ?? [];

    /** VoiceAgent behaviour is carried at the top level so Assist can read it without parsing nodes. */
    const voiceAgentCarry =
      flowType === FlowTypesEnum.VoiceAgent
        ? {
            firstSpeaker: getVoiceAgentFirstSpeaker(nodes),
            voiceIntroduction: getVoiceAgentIntroduction(nodes),
          }
        : {};

    // Create react flow object
    const reactFlowObject = {
      nodes,
      edges,
      viewport,
      ...(flowType === FlowTypesEnum.ChatAgent && {
        defaultActions,
      }),
      ...voiceAgentCarry,
    };

    const hasDesktopOnlyNode = doesFlowContainAnyDesktopOnlyNode(nodes as Node<NodeDataType>[]);

    // Remember what this save persists so onSuccess can baseline it.
    saveSequenceRef.current += 1;
    persistedRef.current = {
      sequence: saveSequenceRef.current,
      snapshot: { nodes, edges, flowVariablesObject: flowVariablesObject ?? [] },
      viewport,
      inputOutputObject,
      flowId: currentFlow.id,
      versionId: currentFlow.versionId,
    };

    // Set isFlowSaving to true
    useCurrentFlowStore.getState().setIsFlowSaving(true);

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
