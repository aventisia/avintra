export type PromptTemplateSchema = {
  prompt?: string;
  modelConfig?: {
    provider?: string;
    model?: string;
    temperature?: number;
    top_p?: number;
    is_json_output?: boolean;
  };
  toolsConfig?: ToolConfig[] | "";
};

export interface ToolAction {
  /**
   * Action that the tool is permitted to perform
   */
  action: string;

  /**
   * Determines whether execution is automatic or requires human approval.
   */
  approval: "auto" | "human";
}

export interface ToolConfig {
  /**
   * Name of the tool or external service
   */
  tool: string;

  /**
   * List of permitted actions for this tool.
   */
  actions: ToolAction[];
}
