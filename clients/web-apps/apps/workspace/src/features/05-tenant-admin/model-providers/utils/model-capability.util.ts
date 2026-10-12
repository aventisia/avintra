import { ModelCapabilityEnum } from "../enums/model-capability-enum";

const capitalizeWord = (part: string) => part.charAt(0).toUpperCase() + part.slice(1);

const CAPABILITY_ACRONYMS = new Set(["tts", "stt", "ocr"]);

const toCapabilityWord = (part: string) =>
  CAPABILITY_ACRONYMS.has(part) ? part.toUpperCase() : capitalizeWord(part);

const splitCapabilityWords = (capability: string) =>
  capability
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .split(/[_\s-]+/)
    .filter(Boolean);

/**
 * Converts an LLM pipeline capability string to a known model capability, or null when unknown.
 */
export const toModelCapability = (capability?: string | null): ModelCapabilityEnum | null => {
  if (!capability) return null;
  const enumValue = capability.split("_").map(capitalizeWord).join("");
  const knownCapabilities = Object.values(ModelCapabilityEnum) as string[];
  return knownCapabilities.includes(enumValue) ? (enumValue as ModelCapabilityEnum) : null;
};

/**
 * Formats a capability string (snake_case or camelCase) into a human-readable label, or null when absent.
 */
export const formatCapabilityLabel = (capability?: string | null): string | null => {
  if (!capability) return null;
  return splitCapabilityWords(capability)
    .map((word) => toCapabilityWord(word.toLowerCase()))
    .join(" ");
};
