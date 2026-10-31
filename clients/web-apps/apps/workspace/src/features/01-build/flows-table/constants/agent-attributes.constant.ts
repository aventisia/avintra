import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import { Cloud, MessagesSquare, Monitor, Workflow } from "lucide-react";

import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";

import { AgentPlatform } from "../types/agent-platform.type";

/** Label and icon of each agent type shown in the agents table. */
export const AGENT_TYPES = [
  {
    value: FlowTypesEnum.Agent,
    label: "Automation agent",
    icon: Workflow,
    tint: "bg-[color-mix(in_srgb,var(--primary)_10%,var(--surface))] text-[color-mix(in_srgb,var(--primary)_75%,var(--ink))] ring-[color-mix(in_srgb,var(--primary)_25%,transparent)]",
  },
  {
    value: FlowTypesEnum.ChatAgent,
    label: "Chat agent",
    icon: MessagesSquare,
    tint: "bg-[color-mix(in_srgb,#0d9488_10%,var(--surface))] text-[color-mix(in_srgb,#0d9488_75%,var(--ink))] ring-[color-mix(in_srgb,#0d9488_25%,transparent)]",
  },
];

/** Label and icon of each place an agent can run. */
export const AGENT_PLATFORMS: { value: AgentPlatform; label: string; icon: typeof Cloud }[] = [
  { value: "cloud", label: "Cloud & Windows", icon: Cloud },
  { value: "windows", label: "Windows", icon: Monitor },
];

/** Label of each access level. */
export const ACCESS_LEVELS: Record<ResourceAccessTypeEnum, { label: string }> = {
  [ResourceAccessTypeEnum.Owner]: { label: "Owner" },
  [ResourceAccessTypeEnum.FullAccess]: { label: "Full access" },
  [ResourceAccessTypeEnum.Edit]: { label: "Can edit" },
  [ResourceAccessTypeEnum.View]: { label: "Can view" },
  [ResourceAccessTypeEnum.Delete]: { label: "Delete" },
  [ResourceAccessTypeEnum.Create]: { label: "Create" },
  [ResourceAccessTypeEnum.Personal]: { label: "Personal" },
};
