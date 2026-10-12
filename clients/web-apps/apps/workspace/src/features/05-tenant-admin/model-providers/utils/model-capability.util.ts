import { ModelCapabilityEnum } from "../enums/model-capability-enum";

/**
 * Converts an LLM pipeline capability string to a known model capability, or null when unknown.
 */
export const toModelCapability = (capability?: string | null): ModelCapabilityEnum | null => {
  if (!capability) return null;
  const enumValue = capability
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  const knownCapabilities = Object.values(ModelCapabilityEnum) as string[];
  return knownCapabilities.includes(enumValue) ? (enumValue as ModelCapabilityEnum) : null;
};
