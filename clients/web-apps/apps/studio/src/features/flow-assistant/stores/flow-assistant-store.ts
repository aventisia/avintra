import { create } from "zustand";

import { GraphProposalDto } from "../dtos/graph-proposal-dto";
import { FlowAssistantMessage } from "../types/flow-assistant-message-type";

type State = {
  isPanelOpen: boolean;
  messages: FlowAssistantMessage[];
  isStreaming: boolean;
  pendingProposal: GraphProposalDto | null;
};

type Actions = {
  togglePanel: () => void;
  addMessage: (message: FlowAssistantMessage) => void;
  appendToLastAssistantMessage: (chunk: string) => void;
  failLastAssistantMessage: (message: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setPendingProposal: (proposal: GraphProposalDto | null) => void;
};

export const useFlowAssistantStore = create<State & Actions>((set) => ({
  isPanelOpen: false,
  messages: [],
  isStreaming: false,
  pendingProposal: null,

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
}));
