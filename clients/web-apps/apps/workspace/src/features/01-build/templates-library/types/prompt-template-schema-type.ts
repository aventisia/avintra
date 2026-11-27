export type PromptTemplateSchema = {
  prompt?: string;
  modelConfig?: {
    provider?: string;
    model?: string;
    is_json_output?: boolean;
  };
  toolsConfig?:
    | {
        tool: string;
        actions: { action: string; approval: "auto" | "human" }[];
      }[]
    | "";
};
