import { type ISelectOption } from "@avplatform/ui/types";

/**
 * Decodes an encoded select option of the form "value||label".
 * Returns undefined when the input is missing or malformed.
 */
const decodePrefilledOption = (raw: string | null): ISelectOption | undefined => {
  if (!raw) return undefined;
  const [value, ...labelParts] = raw.split("||");
  const label = labelParts.join("||");
  if (!value) return undefined;
  return { value, label };
};

export { decodePrefilledOption };
