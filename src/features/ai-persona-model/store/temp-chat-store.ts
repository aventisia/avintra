import { create } from "zustand";

type LLMMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatConfig = {
  llm: string; // Selected LLM
  assistantName: string; // Assistant name
  systemPrompt: string; // System prompt
  temperature: number; // Temperature for response randomness
  maxMessagesInContext: number; // Max messages conversation to keep in context
};

type State = {
  chatConfig: ChatConfig;
  messagesToSend: LLMMessage[]; // Messages to send (including previous one) to LLM
};

type Actions = {
  setChatConfig: (config: ChatConfig) => void;
  setMessagesToSend: (message: LLMMessage) => void;
};

export const useTempChatStore = create<State & Actions>((set) => ({
  chatConfig: {
    llm: "gpt-3.5-turbo",
    assistantName: "",
    systemPrompt: "You are a helpful assistant.",
    temperature: 0.7,
    maxMessagesInContext: 10,
  },
  messagesToSend: [],

  setChatConfig: (config) => set({ chatConfig: config }),
  setMessagesToSend: (message) =>
    set((state) => ({
      messagesToSend: [...state.messagesToSend, message],
    })),
}));
