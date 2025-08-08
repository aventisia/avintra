import { create } from "zustand";

interface SelectedTaskState {
  conversationMarkdown: string;
  setConversationMarkdown: (conversation: string) => void;
}

export const useGenerativeModelOutputStore = create<SelectedTaskState>((set) => ({
    conversationMarkdown: "",
    setConversationMarkdown: (conversation) => set({ conversationMarkdown: conversation }),
}));
