import { ActionTypesEnum } from "@/features/credits-management/constants/action-types-enum";
import { UsageSourceTypesEnum } from "@/features/credits-management/constants/usage-source-types-enum";

import {
  type UiBuilderLlmRequest,
  generateUiBuilderJson,
  streamUiBuilderGeneration,
} from "../apis/ui-builder.apis";
import {
  UI_BUILDER_MAX_OUTPUT_TOKENS,
  needsUiBuilderOutputCap,
} from "../utils/ui-builder-model-routing.util";
import { type UiBuilderModelState } from "./useUiBuilderModels.hook";

type UiBuilderCallArgs = {
  projectId: string;
  projectName: string;
  model: UiBuilderModelState;
  systemPrompt: string;
  userContent: string;
  skillNames?: string[];
  maxOutputTokens?: number;
  files?: string[];
  signal?: AbortSignal;
};

const buildUiBuilderRequest = (args: UiBuilderCallArgs, stream: boolean): UiBuilderLlmRequest => ({
  provider: args.model.provider,
  model: args.model.modelId,
  input: [
    { role: "system", content: args.systemPrompt },
    { role: "user", content: args.userContent },
  ],
  stream,
  is_byok_enabled: true,
  credential_name: args.model.credentialName,
  max_output_tokens:
    args.maxOutputTokens ??
    (needsUiBuilderOutputCap(args.model.provider) ? UI_BUILDER_MAX_OUTPUT_TOKENS : undefined),
  skill_names: args.skillNames,
  files: args.files,
  ref_type: UsageSourceTypesEnum[UsageSourceTypesEnum.UiBuilder],
  ref_id: args.projectId,
  ref_name: args.projectName,
  action: ActionTypesEnum[ActionTypesEnum.UiBuilderGeneration],
});

/**
 * Runs builder LLM calls with the selected tenant model, authenticating with the vault
 * credential configured for its provider in Tenant Admin (or platform credits when none is).
 */
export const useUiBuilderGeneration = () => {
  const generateSource = ({
    onDelta,
    ...args
  }: UiBuilderCallArgs & { onDelta?: (delta: string) => void }) =>
    streamUiBuilderGeneration(buildUiBuilderRequest(args, true), {
      envType: args.model.envType,
      onDelta,
      signal: args.signal,
    });

  const generateJson = <T>(args: UiBuilderCallArgs) =>
    generateUiBuilderJson<T>(buildUiBuilderRequest(args, false), {
      envType: args.model.envType,
      signal: args.signal,
    });

  return { generateSource, generateJson };
};
