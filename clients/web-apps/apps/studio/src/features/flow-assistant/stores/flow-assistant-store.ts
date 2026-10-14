import { create } from "zustand";

import { FLOW_ASSISTANT_DEFAULT_MODEL_ID, FLOW_ASSISTANT_MODEL_OPTIONS } from "../constants";
import { FlowAssistantReferenceDataDto } from "../dtos/flow-assistant-reference-data-dto";
import { GraphProposalDto } from "../dtos/graph-proposal-dto";
import { FlowAssistantMessage } from "../types/flow-assistant-message-type";
import { FlowAssistantQuestionSlot } from "../types/flow-assistant-question-type";

const FLOW_ASSISTANT_MODEL_STORAGE_KEY = "flow-assistant-selected-model-id";

const isSupportedModelId = (value: string | null): value is string =>
  value !== null && FLOW_ASSISTANT_MODEL_OPTIONS.some((option) => option.id === value);

const getInitialModelId = (): string => {
  if (typeof window === "undefined") return FLOW_ASSISTANT_DEFAULT_MODEL_ID;
  const stored = localStorage.getItem(FLOW_ASSISTANT_MODEL_STORAGE_KEY);
  return isSupportedModelId(stored) ? stored : FLOW_ASSISTANT_DEFAULT_MODEL_ID;
};

type State = {
  isPanelOpen: boolean;
  messages: FlowAssistantMessage[];
  isStreaming: boolean;
  pendingProposal: GraphProposalDto | null;
  pendingQuestions: FlowAssistantQuestionSlot[] | null;
  referenceData: FlowAssistantReferenceDataDto | null;
  selectedModelId: string;
};

type Actions = {
  togglePanel: () => void;
  addMessage: (message: FlowAssistantMessage) => void;
  appendToLastAssistantMessage: (chunk: string) => void;
  failLastAssistantMessage: (message: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setPendingProposal: (proposal: GraphProposalDto | null) => void;
  setPendingQuestions: (questions: FlowAssistantQuestionSlot[] | null) => void;
  setReferenceData: (referenceData: FlowAssistantReferenceDataDto) => void;
  setSelectedModelId: (modelId: string) => void;
};

export const useFlowAssistantStore = create<State & Actions>((set) => ({
  isPanelOpen: false,
  messages: [],
  isStreaming: false,
  pendingProposal: null,
  pendingQuestions: null,
  referenceData: null,
  selectedModelId: getInitialModelId(),

  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),

  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

  appendToLastAssistantMessage: (chunk) =>
    set((state) => {
      const messages = [...state.messages];
      const lastIndex = messages.length - 1;
      if (lastIndex < 0 || messages[lastIndex].role !== "assistant") return state;
      messages[lastIndex] = {
        ...messages[lastIndex],
        content: messages[lastIndex].content + chunk,
      };
      return { messages };
    }),

  failLastAssistantMessage: (message) =>
    set((state) => {
      const messages = [...state.messages];
      const lastIndex = messages.length - 1;
      if (lastIndex < 0 || messages[lastIndex].role !== "assistant") {
        return {
          messages: [
            ...messages,
            {
              id: window.crypto.randomUUID(),
              role: "assistant",
              content: message,
              variant: "error",
              createdAt: Date.now(),
            },
          ],
        };
      }
      messages[lastIndex] = { ...messages[lastIndex], content: message, variant: "error" };
      return { messages };
    }),

  setIsStreaming: (isStreaming) => set({ isStreaming }),

  setPendingProposal: (pendingProposal) => set({ pendingProposal }),

  setPendingQuestions: (pendingQuestions) => set({ pendingQuestions }),

  setReferenceData: (referenceData) => set({ referenceData }),

  setSelectedModelId: (selectedModelId) => {
    localStorage.setItem(FLOW_ASSISTANT_MODEL_STORAGE_KEY, selectedModelId);
    set({ selectedModelId });
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== FLOW_ASSISTANT_MODEL_STORAGE_KEY) return;
    const modelId = isSupportedModelId(event.newValue)
      ? event.newValue
      : FLOW_ASSISTANT_DEFAULT_MODEL_ID;
    useFlowAssistantStore.setState({ selectedModelId: modelId });
  });
}
