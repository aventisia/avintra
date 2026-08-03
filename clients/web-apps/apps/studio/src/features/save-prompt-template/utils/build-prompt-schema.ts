import { PromptTemplateSchema, ToolConfig } from "../types/prompt-template-schema-type";

type Payload = {
  [key: string]: unknown;
};

export function buildPromptTemplateSchema(payload: Payload): PromptTemplateSchema {
  const promptKey = Object.keys(payload).find((key) => key.startsWith("__Prompt__"));

  const modelConfigKey = Object.keys(payload).find((key) => key.startsWith("__ModelConfig__"));

  const toolsConfigKey = Object.keys(payload).find((key) => key.startsWith("__ToolsConfig__"));

  const modelConfig = modelConfigKey
    ? (payload[modelConfigKey] as Record<string, unknown>)
    : undefined;

  return {
    prompt: promptKey ? (payload[promptKey] as string) : undefined,

    modelConfig: modelConfig
      ? {
          provider: modelConfig.provider as string | undefined,

          model: modelConfig.model as string | undefined,

          temperature: modelConfig.temperature as number | undefined,

          top_p: modelConfig.top_p as number | undefined,

          is_json_output: modelConfig.is_json_output as boolean | undefined,
        }
      : undefined,

    toolsConfig: normalizeToolsConfig(toolsConfigKey ? payload[toolsConfigKey] : undefined),
  };
}

function normalizeToolsConfig(toolsConfig: unknown): PromptTemplateSchema["toolsConfig"] {
  // We get empty string when tools are not configured
  if (!toolsConfig || toolsConfig === "") {
    return "";
  }

  if (!Array.isArray(toolsConfig)) {
    return "";
  }

  return toolsConfig.map((tool): ToolConfig => {
    const typedTool = tool as Record<string, unknown>;

    return {
      tool: typedTool.tool as string,

      actions: Array.isArray(typedTool.actions)
        ? typedTool.actions.map((action) => {
            const typedAction = action as Record<string, unknown>;

            return {
              action: typedAction.action as string,

              approval: typedAction.approval === "auto" ? "auto" : "human",
            };
          })
        : [],
    };
  });
}
