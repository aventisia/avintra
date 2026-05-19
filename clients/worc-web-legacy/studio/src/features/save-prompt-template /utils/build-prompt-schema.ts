import { PromptTemplateSchema } from "../types/prompt-template-schema-type";

type Payload = {
  [key: string]: unknown;
};

export function buildPromptTemplateSchema(
  payload: Payload,
): PromptTemplateSchema {
  const promptKey = Object.keys(payload).find((key) =>
    key.startsWith("__Prompt__"),
  );

  const modelConfigKey = Object.keys(payload).find((key) =>
    key.startsWith("__ModelConfig__"),
  );

  const toolsConfigKey = Object.keys(payload).find((key) =>
    key.startsWith("__ToolsConfig__"),
  );

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

    toolsConfig: normalizeToolsConfig(
      toolsConfigKey ? payload[toolsConfigKey] : undefined,
    ),
  };
}

function normalizeToolsConfig(
  toolsConfig: unknown,
): PromptTemplateSchema["toolsConfig"] {
  // Current we get empty string when tools are not configured.
  // TODO: Add proper tool validation once tools config is implemented.
  if (!toolsConfig || toolsConfig === "") {
    return "";
  }

  if (!Array.isArray(toolsConfig)) {
    return "";
  }

  return toolsConfig.map((tool) => {
    const typedTool = tool as Record<string, unknown>;

    return {
      platform: typedTool.platform as string | undefined,
      service: typedTool.service as string | undefined,
      tools: typedTool.tools as unknown[] | undefined,
    };
  });
}
