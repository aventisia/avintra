import { type ISelectOption } from "@avplatform/ui/types";

/**
 * Flow-version (agent) search option enriched with the agent's supported platform.
 */
export type FlowVersionSelectOption = ISelectOption & {
  /** Comma-separated platforms the agent supports (for example "cloud" or "windows"). */
  supportedPlatform?: string;
};
