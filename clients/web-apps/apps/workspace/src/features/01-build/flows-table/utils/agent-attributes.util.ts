import { TableCNFilterOption } from "@avplatform/ui/table-cn";

import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";

import { ACCESS_LEVELS } from "../constants/agent-attributes.constant";
import { FlowsTableDto } from "../dtos/flows-table-dto";
import { AgentFilterOptions } from "../types/agent-filter-options.type";
import { AgentPlatform } from "../types/agent-platform.type";

/**
 * Where an agent runs; anything but a Windows-only agent also runs in the cloud.
 */
export const getAgentPlatform = (flow: Pick<FlowsTableDto, "supportedPlatform">): AgentPlatform =>
  flow.supportedPlatform === "windows" ? "windows" : "cloud";

/**
 * Display label of an access level, falling back to the raw value split into words.
 */
export const getAccessLevelLabel = (accessLevel: string) =>
  ACCESS_LEVELS[accessLevel as ResourceAccessTypeEnum]?.label ??
  accessLevel.replace(/([a-z])([A-Z])/g, "$1 $2");

const toFilterOptions = (
  values: (string | undefined)[],
  getLabel: (value: string) => string = (value) => value,
): TableCNFilterOption[] =>
  [...new Set(values)]
    .filter((value): value is string => Boolean(value))
    .map((value) => ({ value, label: getLabel(value) }))
    .sort((first, second) => first.label.localeCompare(second.label));

/**
 * Filter options found in the listed agents: access levels.
 */
export const getAgentFilterOptions = (agents: FlowsTableDto[]): AgentFilterOptions => ({
  accessLevel: toFilterOptions(
    agents.map((agent) => agent.accessLevel),
    getAccessLevelLabel,
  ),
});

/**
 * Link that opens an agent in the Agent Builder. The builder is a separate app under `/studio/`,
 * so such links need a full page load instead of a router navigation.
 */
export const getAgentBuilderLink = (flowId: string | undefined) => {
  const href = `${import.meta.env.VITE_STUDIO_PATH}agent?f=${flowId}`;
  return { href, isExternal: /^https?:\/\//i.test(href) || href.startsWith("/studio/") };
};
