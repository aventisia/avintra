import { FALLBACK_VALUE } from "@/ui/constants";

export const maskIP = (input?: string) => {
  if (!input || input === "0.0.0.0") return FALLBACK_VALUE;

  return input.length < 4
    ? "*****"
    : `${input.slice(0, 2)}${"*".repeat(input.length - 4)}${input.slice(-2)}`;
};
