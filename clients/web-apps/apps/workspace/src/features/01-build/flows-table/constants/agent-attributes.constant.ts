import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import { Cloud, MessagesSquare, Monitor, Workflow } from "lucide-react";

import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";

import { AgentPlatform } from "../types/agent-platform.type";

/** Label, icon, and tint of each agent type shown in the agents table. */
export const AGENT_TYPES = [
  {
    value: FlowTypesEnum.Agent,
    label: "Automation Agent",
    icon: Workflow,
    tint: "bg-sky-50 text-sky-600 ring-sky-100",
  },
  {
    value: FlowTypesEnum.ChatAgent,
    label: "Chat Agent",
    icon: MessagesSquare,
    tint: "bg-violet-50 text-violet-600 ring-violet-100",
  },
];

/** Label and icon of each place an agent can run. */
export const AGENT_PLATFORMS: { value: AgentPlatform; label: string; icon: typeof Cloud }[] = [
  { value: "cloud", label: "Cloud & Windows", icon: Cloud },
  { value: "windows", label: "Windows", icon: Monitor },
];

/** Label and dot color of each access level. */
export const ACCESS_LEVELS: Record<ResourceAccessTypeEnum, { label: string; dot: string }> = {
  [ResourceAccessTypeEnum.Owner]: { label: "Owner", dot: "bg-indigo-500" },
  [ResourceAccessTypeEnum.FullAccess]: { label: "Full access", dot: "bg-emerald-500" },
  [ResourceAccessTypeEnum.Edit]: { label: "Edit", dot: "bg-amber-500" },
  [ResourceAccessTypeEnum.View]: { label: "View", dot: "bg-slate-400" },
  [ResourceAccessTypeEnum.Delete]: { label: "Delete", dot: "bg-rose-500" },
  [ResourceAccessTypeEnum.Create]: { label: "Create", dot: "bg-sky-500" },
  [ResourceAccessTypeEnum.Personal]: { label: "Personal", dot: "bg-indigo-500" },
};
