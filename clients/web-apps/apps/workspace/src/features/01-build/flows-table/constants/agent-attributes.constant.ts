import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import { Cloud, MessagesSquare, Monitor, Workflow } from "lucide-react";

import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";

import { AgentPlatform } from "../types/agent-platform.type";

/** Label, icon, and tint of each agent type shown in the agents table. */
export const AGENT_TYPES = [
  {
    value: FlowTypesEnum.Agent,
    label: "Automation Agent",
    icon: Workflow,
    tint: "bg-sunken text-ink-2 ring-line",
  },
  {
    value: FlowTypesEnum.ChatAgent,
    label: "Chat Agent",
    icon: MessagesSquare,
    tint: "bg-sunken text-ink-2 ring-line",
  },
];

/** Label and icon of each place an agent can run. */
export const AGENT_PLATFORMS: { value: AgentPlatform; label: string; icon: typeof Cloud }[] = [
  { value: "cloud", label: "Cloud & Windows", icon: Cloud },
  { value: "windows", label: "Windows", icon: Monitor },
];

/** Label and dot color of each access level. */
export const ACCESS_LEVELS: Record<ResourceAccessTypeEnum, { label: string; dot: string }> = {
  [ResourceAccessTypeEnum.Owner]: { label: "Owner", dot: "bg-primary" },
  [ResourceAccessTypeEnum.FullAccess]: { label: "Full access", dot: "bg-muted-foreground" },
  [ResourceAccessTypeEnum.Edit]: { label: "Edit", dot: "bg-muted-foreground" },
  [ResourceAccessTypeEnum.View]: { label: "View", dot: "bg-muted-foreground" },
  [ResourceAccessTypeEnum.Delete]: { label: "Delete", dot: "bg-muted-foreground" },
  [ResourceAccessTypeEnum.Create]: { label: "Create", dot: "bg-muted-foreground" },
  [ResourceAccessTypeEnum.Personal]: { label: "Personal", dot: "bg-primary" },
};
