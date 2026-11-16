import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import { format, formatDistanceToNow } from "date-fns";

import { pluralize } from "@/utils/pluralize.util";

import type { FlowAccessAgent } from "../types/flow-access.type";

/**
 * Display label for a flow type; null for types that are not agents.
 */
export const getAgentKindLabel = (type?: string | null) =>
  type === FlowTypesEnum.ChatAgent
    ? "Chat agent"
    : type === FlowTypesEnum.Agent
      ? "Automation agent"
      : type === FlowTypesEnum.VoiceAgent
        ? "Voice Agent"
        : null;

export type AgentMeta = {
  versions: string | null;
  modified: string | null;
  modifiedTitle: string | null;
};

/**
 * Version count and relative modified time of an agent; null when the API did not return them.
 */
export const getAgentMeta = (agent: FlowAccessAgent): AgentMeta => {
  const { versionCount, lastModifiedOn } = agent;
  const modifiedOn = lastModifiedOn ? new Date(lastModifiedOn) : null;
  const hasModifiedOn = !!modifiedOn && !Number.isNaN(modifiedOn.getTime());

  return {
    versions: versionCount == null ? null : `${versionCount} ${pluralize(versionCount, "version")}`,
    modified: hasModifiedOn ? formatDistanceToNow(modifiedOn, { addSuffix: true }) : null,
    modifiedTitle: hasModifiedOn ? `Modified ${format(modifiedOn, "PPpp")}` : null,
  };
};
