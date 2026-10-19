import { EnabledModelDto } from "../dtos/enabled-model.dto";
import { LlmModelInfoDto } from "../dtos/llm-provider-v2-dto";

const LEGACY_LIMIT_SUFFIX_PATTERN = /\/\d+$/;

/**
 * Returns the canonical id stored for a provider model: the catalog's `provider/` prefix and
 * legacy `/<token-limit>` suffixes are removed, so catalog and saved ids compare equal.
 */
export const toCanonicalModelId = (providerValue: string, modelId: string) => {
  const prefix = `${providerValue.trim().toLowerCase()}/`;
  const trimmed = modelId.trim();
  const unprefixed = trimmed.toLowerCase().startsWith(prefix)
    ? trimmed.slice(prefix.length)
    : trimmed;
  return unprefixed.replace(LEGACY_LIMIT_SUFFIX_PATTERN, "");
};

/** Canonicalizes and de-duplicates saved model ids. */
export const canonicalizeModelIds = (providerValue: string, modelIds: string[]) => [
  ...new Set(modelIds.map((modelId) => toCanonicalModelId(providerValue, modelId))),
];

/** Canonicalizes and de-duplicates saved enabled models, keeping the first capability seen. */
export const canonicalizeEnabledModels = (
  providerValue: string,
  enabledModels: EnabledModelDto[],
) => {
  const byId = new Map<string, EnabledModelDto>();
  for (const enabledModel of enabledModels) {
    const modelId = toCanonicalModelId(providerValue, enabledModel.modelId);
    if (!byId.has(modelId)) byId.set(modelId, { ...enabledModel, modelId });
  }
  return [...byId.values()];
};

/** Canonicalizes catalog model ids and drops entries that collapse onto the same id. */
export const canonicalizeProviderModels = (providerValue: string, models: LlmModelInfoDto[]) => {
  const byId = new Map<string, LlmModelInfoDto>();
  for (const model of models) {
    const id = toCanonicalModelId(providerValue, model.id);
    if (!byId.has(id)) byId.set(id, { ...model, id });
  }
  return [...byId.values()];
};
