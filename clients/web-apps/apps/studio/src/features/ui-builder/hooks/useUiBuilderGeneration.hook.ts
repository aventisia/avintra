import { ActionTypesEnum } from "@/features/credits-management/constants/action-types-enum";
import { UsageSourceTypesEnum } from "@/features/credits-management/constants/usage-source-types-enum";
import { LLMRequestDto } from "@/features/dynamic-config-panel/dtos/llm-providers-dto";

import { streamUiBuilderGeneration } from "../apis/ui-builder.apis";
import { type UiBuilderModelOption } from "../constants/ui-builder-models.constant";
import {
  UI_BUILDER_SYSTEM_PROMPT,
  buildUiBuilderUserContent,
} from "../constants/ui-builder-system-prompt.constant";

type GenerateUiBuilderArgs = {
  projectId: string;
  projectName: string;
  model: UiBuilderModelOption;
  prompt: string;
  currentHtml: string;
  onDelta?: (delta: string) => void;
  signal?: AbortSignal;
};

/**
 * Generates a single standalone HTML document for the builder using the tenant's
 * platform credits, streaming output deltas as the model produces them.
 */
export const useUiBuilderGeneration = () => {
  const generate = async ({
    projectId,
    projectName,
    model,
    prompt,
    currentHtml,
    onDelta,
    signal,
  }: GenerateUiBuilderArgs) => {
    const request: LLMRequestDto = {
      provider: model.provider,
      model: model.model,
      input: [
        { role: "system", content: UI_BUILDER_SYSTEM_PROMPT },
        { role: "user", content: buildUiBuilderUserContent(currentHtml, prompt) },
      ],
      is_json_output: false,
      is_byok_enabled: false,
      stream: true,
      ref_type: UsageSourceTypesEnum[UsageSourceTypesEnum.UiBuilder],
      ref_id: projectId,
      ref_name: projectName,
      action: ActionTypesEnum[ActionTypesEnum.UiBuilderGeneration],
    };

    return streamUiBuilderGeneration(request, { onDelta, signal });
  };

  return { generate };
};
