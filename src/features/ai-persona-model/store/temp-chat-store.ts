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
  languageId?: string; // Optional language for responses
  voiceId?: string; // Optional voice ID for TTS
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
    languageId: undefined,
    voiceId: undefined,
  },
  messagesToSend: [],

  setChatConfig: (config) => set({ chatConfig: config }),
  setMessagesToSend: (message) =>
    set((state) => {
      if (
        message.role === "assistant" &&
        state.messagesToSend.length > 0 &&
        state.messagesToSend[state.messagesToSend.length - 1].role ===
          "assistant"
      ) {
        // Append chunk to last assistant message
        const updated = [...state.messagesToSend];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: updated[updated.length - 1].content + " " + message.content,
        };
        return { messagesToSend: updated };
      }
      // Otherwise, add new message
      return { messagesToSend: [...state.messagesToSend, message] };
    }),
}));
