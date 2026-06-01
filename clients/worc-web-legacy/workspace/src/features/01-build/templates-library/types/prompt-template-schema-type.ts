export type PromptTemplateSchema = {
  prompt?: string;
  modelConfig?: {
    provider?: string;
    model?: string;
    temperature?: number;
    top_p?: number;
    is_json_output?: boolean;
  };
  toolsConfig?:
    | {
        tool: string;
        actions: { action: string; approval: "auto" | "human" }[];
      }[]
    | "";
};
