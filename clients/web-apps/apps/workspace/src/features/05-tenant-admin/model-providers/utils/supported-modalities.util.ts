import { formatCapabilityLabel } from "@avplatform/ui/utils";

import { LlmModelInfoDto } from "../dtos/llm-provider-v2-dto";

/**
 * Reads `supported_modalities` from a model's metadata and returns them as readable labels,
 * or null when the field is absent or empty.
 */
export const getSupportedModalities = (model: LlmModelInfoDto): string[] | null => {
  const modalities = model.metadata?.supported_modalities;
  if (!Array.isArray(modalities)) return null;

  const labels = modalities
    .filter((modality): modality is string => typeof modality === "string")
    .map((modality) => formatCapabilityLabel(modality) ?? modality);

  return labels.length > 0 ? labels : null;
};
