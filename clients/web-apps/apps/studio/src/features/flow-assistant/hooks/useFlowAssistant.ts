import { FlowTypesEnum } from "@avplatform/ui/enums";
import { useCallback, useEffect, useRef } from "react";

import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { streamFlowAssistant } from "../apis/flow-assistant-apis";
import { streamFlowAssistantStub } from "../apis/flow-assistant-stub-apis";
import { FLOW_ASSISTANT_USE_STUB } from "../constants";
import { FlowAssistantRequestDto } from "../dtos/flow-assistant-request-dto";
import { GraphProposalDto } from "../dtos/graph-proposal-dto";
import { useFlowAssistantStore } from "../stores/flow-assistant-store";
import { FlowAssistantFrame } from "../types/flow-assistant-frame-type";

const isGraphProposal = (value: unknown): value is GraphProposalDto => {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<GraphProposalDto>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.summary === "string" &&
    (candidate.mode === "create" || candidate.mode === "edit") &&
    Array.isArray(candidate.operations)
  );
};

const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "AbortError";

/** Orchestrates flow-assistant send, stream, and cancel. */
export const useFlowAssistant = () => {
  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    useFlowAssistantStore.getState().setIsStreaming(false);
  }, []);

  useEffect(() => () => cancel(), [cancel]);

  const handleFrame = useCallback((frame: FlowAssistantFrame) => {
    const store = useFlowAssistantStore.getState();
    switch (frame.type) {
      case "delta":
        store.appendToLastAssistantMessage(frame.output);
        break;
      case "graph_proposal":
        if (isGraphProposal(frame.output)) {
          store.setPendingProposal(frame.output);
          store.setPendingQuestions(null);
        }
        break;
      case "question":
        store.appendToLastAssistantMessage(frame.output);
        break;
      case "questions":
        if (frame.output.length === 0) break;
        store.setPendingQuestions(frame.output);
        store.setPendingProposal(null);
        if (frame.output.length === 1 && !frame.output[0].nodeName) {
          store.appendToLastAssistantMessage(frame.output[0].label);
        } else {
          const needed = frame.output
            .map((slot) => (slot.nodeName ? `${slot.label} (${slot.nodeName})` : slot.label))
            .join(", ");
          store.appendToLastAssistantMessage(
            `I need a few values before I can build this flow: ${needed}. Fill them below.`,
          );
        }
        break;
      case "error":
        store.failLastAssistantMessage(frame.message);
        break;
      case "done":
        break;
    }
  }, []);

  const sendMessage = useCallback(
    async (rawInput: string) => {
      const userInput = rawInput.trim();
      if (!userInput) return;
      if (useReactFlowExtStore.getState().flowType !== FlowTypesEnum.Agent) return;
      if (useFlowAssistantStore.getState().isStreaming) return;

      cancel();
      const controller = new AbortController();
      abortRef.current = controller;

      const now = Date.now();
      const store = useFlowAssistantStore.getState();
      store.addMessage({
        id: window.crypto.randomUUID(),
        role: "user",
        content: userInput,
        createdAt: now,
      });
      store.addMessage({
        id: window.crypto.randomUUID(),
        role: "assistant",
        content: "",
        createdAt: now + 1,
      });
      store.setPendingProposal(null);
      store.setPendingQuestions(null);
      store.setIsStreaming(true);

      const { currentFlow } = useCurrentFlowStore.getState();
      const { nodes, edges } = useReactFlowExtStore.getState();
      const threadMessages = useFlowAssistantStore
        .getState()
        .messages.filter((message) => message.content.trim().length > 0)
        .map((message) => ({ role: message.role, content: message.content }));

      const request: FlowAssistantRequestDto = {
        flowVersionId: currentFlow.versionId,
        flowId: currentFlow.id,
        userInput,
        threadMessages,
        graphContext: { nodes, edges },
        selectedNodeId: nodes.find((node) => node.selected)?.id,
        referenceData: useFlowAssistantStore.getState().referenceData ?? undefined,
        modelId: useFlowAssistantStore.getState().selectedModelId,
      };

      try {
        const stream = FLOW_ASSISTANT_USE_STUB
          ? streamFlowAssistantStub(request, controller.signal)
          : streamFlowAssistant(request, controller.signal);

        for await (const frame of stream) {
          if (controller.signal.aborted) return;
          handleFrame(frame);
        }
      } catch (error) {
        if (controller.signal.aborted || isAbortError(error)) return;
        useFlowAssistantStore
          .getState()
          .failLastAssistantMessage(
            "The assistant could not complete the request. Please try again.",
          );
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
        useFlowAssistantStore.getState().setIsStreaming(false);
      }
    },
    [cancel, handleFrame],
  );

  return { sendMessage, cancel };
};
