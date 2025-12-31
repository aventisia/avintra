import { create } from "zustand";

import { GenerativeModelOutputDTO } from "../dtos/generative-model-output-dto";

interface SelectedTaskState {
  conversationMarkdownList: GenerativeModelOutputDTO[];
  setConversationMarkdown: (conversation: GenerativeModelOutputDTO[]) => void;
}

export const useGenerativeModelOutputStore = create<SelectedTaskState>(
  (set) => ({
    conversationMarkdownList: [],
    setConversationMarkdown: (conversation) =>
      set((state) => ({
        conversationMarkdownList: [
          ...state.conversationMarkdownList,
          ...conversation,
        ],
      })),
  }),
);
