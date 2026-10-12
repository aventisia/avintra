type FlowAssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  variant?: "error";
  createdAt: number;
};

export type { FlowAssistantMessage };
