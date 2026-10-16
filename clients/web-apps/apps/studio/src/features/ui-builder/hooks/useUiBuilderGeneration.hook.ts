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

type GenerateUiBuilderSourceArgs = {
  projectId: string;
  projectName: string;
  model: UiBuilderModelOption;
  systemPrompt: string;
  userContent: string;
  skillNames?: string[];
  onDelta?: (delta: string) => void;
  signal?: AbortSignal;
};

const buildUiBuilderRequest = (
  args: Pick<
    GenerateUiBuilderSourceArgs,
    "projectId" | "projectName" | "model" | "systemPrompt" | "userContent" | "skillNames"
  >,
): LLMRequestDto => ({
  provider: args.model.provider,
  model: args.model.model,
  input: [
    { role: "system", content: args.systemPrompt },
    { role: "user", content: args.userContent },
  ],
  is_json_output: false,
  is_byok_enabled: false,
  stream: true,
  ref_type: UsageSourceTypesEnum[UsageSourceTypesEnum.UiBuilder],
  ref_id: args.projectId,
  ref_name: args.projectName,
  action: ActionTypesEnum[ActionTypesEnum.UiBuilderGeneration],
  skill_names: args.skillNames,
});

/**
 * Generates interface documents for the builder using the tenant's platform credits,
 * streaming output deltas as the model produces them.
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
    const request = buildUiBuilderRequest({
      projectId,
      projectName,
      model,
      systemPrompt: UI_BUILDER_SYSTEM_PROMPT,
      userContent: buildUiBuilderUserContent(currentHtml, prompt),
    });

    return streamUiBuilderGeneration(request, { onDelta, signal });
  };

  const generateSource = async ({
    projectId,
    projectName,
    model,
    systemPrompt,
    userContent,
    skillNames,
    onDelta,
    signal,
  }: GenerateUiBuilderSourceArgs) => {
    const request = buildUiBuilderRequest({
      projectId,
      projectName,
      model,
      systemPrompt,
      userContent,
      skillNames,
    });

    return streamUiBuilderGeneration(request, { onDelta, signal });
  };

  return { generate, generateSource };
};
